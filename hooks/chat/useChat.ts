"use client";

import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { RealtimeEvents } from "@/lib/realtime";
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
  id: string; // server id or temporary
  clientId?: string; // client-generated for optimistic reconciliation
  text: string;
  sender: "seller" | "buyer";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
}

const FETCH_POLICY_NO_CACHE: FetchPolicy = "no-cache";

export const useSellerChat = (conversationId?: string | null) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownError, setHasShownError] = useState(false); // throttle repeated toasts

  // Reset when switching conversations
  const lastConversationRef = useRef<string | null | undefined>(conversationId);
  useEffect(() => {
    if (lastConversationRef.current !== conversationId) {
      lastConversationRef.current = conversationId ?? null;
      setMessages([]);
      setError(null);
      setIsLoading(false);
      setHasShownError(false);
    }
  }, [conversationId]);

  // Normalize server -> LocalMessage
  const normalizeServerMessage = useCallback((msg: any): LocalMessage => {
    const attachments = (
      msg.attachments && msg.attachments.length > 0
        ? msg.attachments.map((a: any) => ({
            id: a.id,
            url: a.url,
            type: a.type as "IMAGE" | "VIDEO",
          }))
        : msg.fileUrl
        ? [
            {
              id: msg.id,
              url: msg.fileUrl,
              type: (msg.type as "IMAGE" | "VIDEO") ?? "IMAGE",
            },
          ]
        : []
    ) as LocalMessage["attachments"];

    return {
      id: msg.id,
      clientId: msg.clientId ?? undefined,
      text: msg.content || "",
      sender: msg.sender?.role === "SELLER" ? "seller" : "buyer",
      timestamp: new Date(msg.sentAt),
      status: "sent",
      attachments,
    };
  }, []);

  // Upsert helper to avoid duplicates (by id or clientId)
  const upsertServerMessage = useCallback((incoming: LocalMessage) => {
    setMessages((prev) => {
      // 1) Replace by server id if exists
      const byServerId = prev.findIndex((m) => m.id === incoming.id);
      if (byServerId >= 0) {
        const copy = prev.slice();
        const keptClientId = prev[byServerId].clientId ?? incoming.clientId;
        copy[byServerId] = {
          ...incoming,
          clientId: keptClientId,
          status: "sent",
        };
        return copy;
      }

      // 2) Replace by clientId if echoed
      if (incoming.clientId) {
        const byClientId = prev.findIndex(
          (m) => m.clientId === incoming.clientId
        );
        if (byClientId >= 0) {
          const copy = prev.slice();
          copy[byClientId] = {
            ...incoming,
            clientId: incoming.clientId,
            status: "sent",
          };
          return copy;
        }
      }

      // 3) Fallback: latest "sending" from same sender and same text
      const candidateIndex = [...prev]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(
          ({ m }) =>
            m.status === "sending" &&
            m.sender === incoming.sender &&
            m.text === incoming.text
        )?.i;

      if (candidateIndex !== undefined) {
        const copy = prev.slice();
        const keptClientId = copy[candidateIndex].clientId;
        // optional: revoke blob URLs from optimistic preview to free memory
        // copy[candidateIndex].attachments?.forEach(a => a.url.startsWith("blob:") && URL.revokeObjectURL(a.url));
        copy[candidateIndex] = {
          ...incoming,
          clientId: keptClientId,
          status: "sent",
        };
        return copy;
      }

      // 4) Append if truly new
      return [...prev, { ...incoming, status: "sent" }];
    });
  }, []);

  // Fetch messages lazily for better control
  const [fetchMessages, { error: messageError }] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: FETCH_POLICY_NO_CACHE,
  });

  // Initial load + when conversation changes
  useEffect(() => {
    const run = async () => {
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
        const serverMsgs: LocalMessage[] =
          data?.messages
            ?.map(normalizeServerMessage)
            .sort(
              (a: LocalMessage, b: LocalMessage) =>
                a.timestamp.getTime() - b.timestamp.getTime()
            ) ?? [];
        setMessages(serverMsgs);
        setHasShownError(false);
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
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, fetchMessages, normalizeServerMessage]);

  // Manual refresh
  const refetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const { data } = await fetchMessages({
        variables: { conversationId, limit: 50, offset: 0 },
      });
      const serverMsgs: LocalMessage[] =
        data?.messages
          ?.map(normalizeServerMessage)
          .sort(
            (a: LocalMessage, b: LocalMessage) =>
              a.timestamp.getTime() - b.timestamp.getTime()
          ) ?? [];
      setMessages(serverMsgs);
    } catch (e) {
      const msg =
        e instanceof ApolloError
          ? e.message
          : (e as Error)?.message || "Failed to refresh messages";
      setError(msg);
      if (!hasShownError) {
        toast.error(msg);
        setHasShownError(true);
      }
    }
  }, [conversationId, fetchMessages, normalizeServerMessage, hasShownError]);

  // Send mutation (no onCompleted; we reconcile manually)
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId || (!text.trim() && !files?.length)) return;

      const clientId = crypto.randomUUID();
      const optimisticAttachments =
        files?.map((file) => ({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file), // preview; consider revoking later
          type: file.type.includes("video") ? "VIDEO" : "IMAGE",
        })) ?? [];

      const optimistic: LocalMessage = {
        id: clientId, // temp id for keying
        clientId,
        text: text.trim(),
        sender: "seller",
        timestamp: new Date(),
        status: "sending",
        attachments: optimisticAttachments,
      };

      setMessages((prev) => [...prev, optimistic]);
      setError(null);

      try {
        // TODO: Upload files to storage and return [{ url, type }]
        let uploadedAttachments:
          | { url: string; type: "IMAGE" | "VIDEO" }[]
          | undefined;

        if (files?.length) {
          // uploadedAttachments = await uploadFilesToStorage(files);
          uploadedAttachments = undefined; // placeholder
        }

        const msgType: "TEXT" | "IMAGE" | "VIDEO" = files?.length
          ? files[0].type.includes("video")
            ? "VIDEO"
            : "IMAGE"
          : "TEXT";

        const { data } = await sendMessageMutation({
          variables: {
            input: {
              conversationId,
              content: text.trim() || undefined,
              type: msgType,
              attachments: uploadedAttachments,
              clientId, // echo back from server to reconcile
            },
          },
        });

        const serverMsg = data?.sendMessage;
        if (!serverMsg) return;

        const normalized = normalizeServerMessage(serverMsg);
        if (!normalized.clientId) normalized.clientId = clientId; // fallback if server doesn’t echo
        upsertServerMessage(normalized);

        // Optional: revoke optimistic blob URLs after reconciliation
        // optimisticAttachments.forEach((a) => a.url.startsWith("blob:") && URL.revokeObjectURL(a.url));
      } catch (e: any) {
        const msg = e?.message || "Failed to send message";
        setError(msg);
        if (!hasShownError) {
          toast.error(msg);
          setHasShownError(true);
        }
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
      hasShownError,
    ]
  );

  // Realtime: upsert and dedupe
  const handleRealtimeNewMessage = useCallback(
    (payload: RealtimeEvents["message"]["newMessage"]) => {
      if (!payload) return;
      // If your realtime payload includes clientId, it will reconcile cleanly
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
    refetchMessages, // manual refresh
  };
};
