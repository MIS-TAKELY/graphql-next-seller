// hooks/chat/useSellerChat.ts
"use client";

import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { NewMessagePayload } from "@/lib/realtime";
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

// Generated types
import { Message, Role, User } from "@/app/generated/prisma";
// Enum for mutation inputs
import { MessageType as MessageTypeEnum } from "@/types/common/enums";
// Frontend specific types
import type {
  FileType,
  MessageAttachment,
  MessageType,
} from "@/types/customer/customer.types";

export type LocalMessageStatus = "sending" | "sent" | "failed";
export type LocalMessageSender = "seller" | "buyer";

export interface LocalMessage {
  id: string;
  clientId?: string;
  text: string;
  sender: LocalMessageSender;
  timestamp: Date;
  status?: LocalMessageStatus;
  attachments?: MessageAttachment[];
}

/**
 * Represents the structure coming from the GraphQL Query (GET_MESSAGES).
 * Based on your logic, it includes a sender with roles and an attachments array.
 */
interface ServerMessage extends Omit<Message, "senderId" | "createdAt" | "updatedAt"> {
  sender: Pick<
    User,
    "id" | "email" | "firstName" | "lastName" | "avatarImageUrl"
  > & {
    roles: Array<{ role: Role }>;
  };
  attachments?: Array<{
    id?: string;
    url: string;
    type: string;
  }>;
  // GraphQL often returns Date strings, Prisma types return Date objects.
  // We allow both here to be safe before normalization.
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Represents the shape of the payload expected from Realtime/Socket events.
 * Since NewMessagePayload is external, we intersect it with the fields
 * your logic actually accesses (sender, attachments, dates).
 */
type RealtimeMessageInput = NewMessagePayload & {
  clientId?: string;
  id?: string;
  content?: string | null;
  fileUrl?: string | null;
  type?: string | MessageType;
  attachments?: Array<{
    id?: string;
    url: string;
    type: string;
  }>;
  sender?: {
    roles?: Array<{ role: Role | string }>;
  };
  // Realtime payloads might have different date keys or string formats
  createdAt?: string | Date;
  updatedAt?: string | Date;
  sentAt?: string | Date;
};

// Union type for the normalizer function
type MessageInput = ServerMessage | RealtimeMessageInput;

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

  const normalizeServerMessage = useCallback(
    (msg: MessageInput): LocalMessage => {
      const attachments: MessageAttachment[] | undefined = msg.attachments?.length
        ? msg.attachments.map((a) => ({
          id: a.id || crypto.randomUUID(),
          messageId: msg.id || "",
          url: a.url,
          type: a.type as FileType,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        : msg.fileUrl
          ? [
            {
              id: msg.id || crypto.randomUUID(),
              messageId: msg.id || "",
              url: msg.fileUrl,
              type: (msg.type as FileType) || "IMAGE",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]
          : undefined;

      const isSeller = Array.isArray(msg.sender?.roles)
        ? msg.sender!.roles!.some((r: any) => r.role === "SELLER")
        : false;

      // Logic to resolve timestamp from various possible keys
      const rawDate =
        (msg as ServerMessage).createdAt ||
        (msg as RealtimeMessageInput).updatedAt ||
        (msg as RealtimeMessageInput).sentAt ||
        new Date();

      const timestamp = new Date(rawDate);

      return {
        id: msg.id || crypto.randomUUID(),
        clientId: msg.clientId ?? undefined,
        text: msg.content || "",
        sender: isSeller ? "seller" : "buyer",
        timestamp,
        status: "sent" as const,
        attachments,
      };
    },
    []
  );

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

  const loadMessages = useCallback(
    async (silent: boolean = false) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const { data } = await fetchMessages({
          variables: { conversationId, limit: 50, offset: 0 },
        });

        if (data?.messages) {
          const serverMsgs: LocalMessage[] = data.messages
            .map((m: any) => normalizeServerMessage(m)) // Explicit any cast for raw GQL response if types don't align perfectly
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
        if (!hasShownError && !silent) {
          toast.error(msg);
          setHasShownError(true);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [conversationId, fetchMessages, normalizeServerMessage, hasShownError]
  );

  useEffect(() => {
    loadMessages(false);
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      loadMessages(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [conversationId, loadMessages]);

  const refetchMessages = useCallback(
    async (silent: boolean = false) => {
      await loadMessages(silent);
    },
    [loadMessages]
  );

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
          messageId: clientId,
          url: URL.createObjectURL(file),
          type: (file.type.startsWith("video/")
            ? "VIDEO"
            : file.type.startsWith("image/")
              ? "IMAGE"
              : "DOCUMENT") as FileType,
          createdAt: new Date(),
          updatedAt: new Date(),
        })) as MessageAttachment[]) ?? [];

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

        let msgType: MessageType = MessageTypeEnum.TEXT;

        if (uploadedAttachments?.length) {
          if (uploadedAttachments.some((a) => a.type === "VIDEO")) {
            msgType = MessageTypeEnum.VIDEO;
          } else {
            msgType = MessageTypeEnum.IMAGE;
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

        // Mutating the response object to include attachments if backend didn't return them immediately
        // Note: It's cleaner to clone, but keeping logic as requested
        const msgToNormalize = { ...serverMsg };

        if (
          uploadedAttachments &&
          (!msgToNormalize.attachments || !msgToNormalize.attachments.length)
        ) {
          msgToNormalize.attachments = uploadedAttachments;
        }

        const normalized = normalizeServerMessage({
          ...msgToNormalize,
          clientId,
        } as ServerMessage); // Casting here as we know the structure matches ServerMessage

        upsertServerMessage(normalized);

        optimisticAttachments.forEach((a) => URL.revokeObjectURL(a.url));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to send";
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
    (payload: NewMessagePayload) => {
      if (!payload) return;

      // Force cast payload to RealtimeMessageInput to satisfy the generic MessageInput union
      // This is safe assuming your realtime payload contains the necessary fields used in normalizeServerMessage
      const normalized = normalizeServerMessage(payload as unknown as RealtimeMessageInput);
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

  // useRealtime types don't match the actual runtime API perfectly in some versions
  (useRealtime as any)({
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