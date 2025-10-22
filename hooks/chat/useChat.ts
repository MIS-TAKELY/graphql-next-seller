// hooks/chat/useSellerChat.ts
"use client";

import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { RealtimeEvents } from "@/lib/realtime";
import { uploadFilesToStorage } from "@/utils/uploadFilesToStorage";
import {
  ApolloError,
  FetchPolicy,
  useLazyQuery,
  useMutation,
} from "@apollo/client";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export interface LocalMessage {
  id: string;
  clientId?: string;
  text: string;
  sender: "seller" | "buyer";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO";
  }>;
}

const FETCH_POLICY_NO_CACHE: FetchPolicy = "no-cache";

export const useSellerChat = (conversationId?: string | null) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownError, setHasShownError] = useState(false);

  const lastConversationRef = useRef<string | null | undefined>(conversationId);

  useEffect(() => {
    if (lastConversationRef.current !== conversationId) {
      lastConversationRef.current = conversationId;
      setMessages([]);
      setError(null);
      setIsLoading(false);
      setHasShownError(false);
    }
  }, [conversationId]);

  const normalizeServerMessage = useCallback((msg: any): LocalMessage => {
    const attachments = msg.attachments?.length
      ? msg.attachments.map((a: any) => ({
          id: a.id || crypto.randomUUID(),
          url: a.url,
          type: a.type as "IMAGE" | "VIDEO" | "DOCUMENT",
        }))
      : msg.fileUrl
      ? [
          {
            id: msg.id || crypto.randomUUID(),
            url: msg.fileUrl,
            type: msg.type as "IMAGE" | "VIDEO" | "DOCUMENT",
          },
        ]
      : undefined;

    return {
      id: msg.id,
      clientId: msg.clientId ?? undefined,
      text: msg.content || "",
      sender: msg.sender?.role === "SELLER" ? "seller" : "buyer",
      timestamp: new Date(msg.sentAt || msg.createdAt || new Date()),
      status: "sent" as const,
      attachments,
    };
  }, []);

  const upsertServerMessage = useCallback((incoming: LocalMessage) => {
    setMessages((prev) => {
      const cleanBlobs = (msg: LocalMessage) => {
        msg.attachments?.forEach((a) => {
          if (a.url.startsWith("blob:")) {
            URL.revokeObjectURL(a.url);
          }
        });
      };

      const updated = [...prev];
      const byServerId = updated.findIndex((m) => m.id === incoming.id);
      if (byServerId >= 0) {
        cleanBlobs(updated[byServerId]);
        updated[byServerId] = {
          ...incoming,
          clientId: updated[byServerId].clientId ?? incoming.clientId,
          status: "sent",
        };
        return updated;
      }

      if (incoming.clientId) {
        const byClientId = updated.findIndex(
          (m) => m.clientId === incoming.clientId
        );
        if (byClientId >= 0) {
          cleanBlobs(updated[byClientId]);
          updated[byClientId] = { ...incoming, status: "sent" };
          return updated;
        }
      }

      const candidateIndex = [...updated]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(
          ({ m }) =>
            m.status === "sending" &&
            m.sender === incoming.sender &&
            Math.abs(m.timestamp.getTime() - incoming.timestamp.getTime()) <
              5000
        )?.i;

      if (candidateIndex !== undefined) {
        cleanBlobs(updated[candidateIndex]);
        updated[candidateIndex] = {
          ...incoming,
          clientId: updated[candidateIndex].clientId,
          status: "sent",
        };
        return updated;
      }

      return [...updated, { ...incoming, status: "sent" }];
    });
  }, []);

  const [fetchMessages] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
    onError: (error) => {
      console.error("Failed to fetch messages:", error);
    },
  });

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await fetchMessages({
        variables: { conversationId, limit: 50, offset: 0 },
      });

      if (data?.messages) {
        const serverMsgs: LocalMessage[] = data.messages
          .map(normalizeServerMessage)
          .sort(
            (a: LocalMessage, b: LocalMessage) =>
              a.timestamp.getTime() - b.timestamp.getTime()
          );
        setMessages(serverMsgs);
        setHasShownError(false);
      }
    } catch (e) {
      const msg =
        e instanceof ApolloError
          ? e.message
          : (e as Error)?.message || "Failed to load messages";
      setError(msg);
      if (!hasShownError) {
        toast.error(msg);
        setHasShownError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, fetchMessages, normalizeServerMessage, hasShownError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const refetchMessages = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.error("Send message error:", error);
    },
  });

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId || (!text.trim() && !files?.length)) return;

      const clientId = crypto.randomUUID();
      const optimisticAttachments =
        (files?.map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          type: file.type.startsWith("video/")
            ? "VIDEO"
            : file.type.startsWith("image/")
            ? "IMAGE"
            : "DOCUMENT",
        })) as {
          id: string;
          url: string;
          type: "IMAGE" | "VIDEO";
        }[]) ?? [];

      const optimistic: LocalMessage = {
        id: clientId,
        clientId,
        text: text.trim(),
        sender: "seller",
        timestamp: new Date(),
        status: "sending",
        attachments:
          optimisticAttachments.length > 0 ? optimisticAttachments : undefined,
      };

      setMessages((prev) => [...prev, optimistic]);
      setError(null);

      try {
        const tooBig = files?.find((f) => f.size > 10 * 1024 * 1024);
        if (tooBig) throw new Error(`"${tooBig.name}" exceeds 10MB limit`);

        const uploadedAttachments = files?.length
          ? await uploadFilesToStorage(files)
          : undefined;

        let msgType: "TEXT" | "IMAGE" | "VIDEO"  = "TEXT";

        if (uploadedAttachments?.length) {
          if (uploadedAttachments.some((a) => a.type === "VIDEO")) {
            msgType = "VIDEO";
          }  else {
            msgType = "IMAGE";
          }
        }

        const { data } = await sendMessageMutation({
          variables: {
            input: {
              conversationId,
              content: text.trim() || undefined,
              type: msgType,
              attachments: uploadedAttachments,
              clientId,
            },
          },
        });

        const serverMsg = data?.sendMessage;
        if (!serverMsg) throw new Error("No server response");

        if (
          uploadedAttachments &&
          (!serverMsg.attachments || !serverMsg.attachments.length)
        ) {
          serverMsg.attachments = uploadedAttachments;
        }

        const normalized = normalizeServerMessage({ ...serverMsg, clientId });
        upsertServerMessage(normalized);

        optimisticAttachments.forEach((a) => URL.revokeObjectURL(a.url));
      } catch (e: any) {
        const msg = e?.message || "Failed to send";
        setError(msg);
        toast.error(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.clientId === clientId ? { ...m, status: "failed" } : m
          )
        );
      }
    },
    [
      conversationId,
      sendMessageMutation,
      normalizeServerMessage,
      upsertServerMessage,
    ]
  );

  const handleRealtimeNewMessage = useCallback(
    (payload: RealtimeEvents["message"]["newMessage"]) => {
      if (!payload) return;
      const normalized = normalizeServerMessage(payload);
      upsertServerMessage(normalized);
    },
    [normalizeServerMessage, upsertServerMessage]
  );

  const events = useMemo(
    () => ({
      message: {
        newMessage: handleRealtimeNewMessage,
      },
    }),
    [handleRealtimeNewMessage]
  );

  useRealtime<RealtimeEvents>({
    channel: conversationId ? `conversation:${conversationId}` : undefined,
    events,
  });

  return {
    messages,
    handleSend,
    isLoading,
    error,
    refetchMessages,
  };
};
