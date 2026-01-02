// hooks/chat/useSellerChat.ts
"use client";

import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import { MARK_AS_READ } from "@/client/conversatation/conversation.mutation";
import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { GET_ME } from "@/client/user/user.query";
import { useSession } from "@/lib/auth-client";
import { NewMessagePayload } from "@/lib/realtime";
import { uploadFilesToStorage } from "@/utils/uploadFilesToStorage";
import {
  ApolloError,
  FetchPolicy,
  useLazyQuery,
  useMutation,
  useQuery,
} from "@apollo/client";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  senderId?: string;
  timestamp: Date;
  status?: LocalMessageStatus;
  isRead?: boolean;
  attachments?: MessageAttachment[];
}

/**
 * Represents the structure coming from the GraphQL Query (GET_MESSAGES).
 * Based on your logic, it includes a sender with roles and an attachments array.
 */
interface ServerMessage
  extends Omit<Message, "senderId" | "createdAt" | "updatedAt"> {
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
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const isLoaded = !isPending;
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasShownError, setHasShownError] = useState(false);

  const lastConversationRef = useRef<string | null | undefined>(conversationId);

  useEffect(() => {
    if (lastConversationRef.current !== conversationId) {
      lastConversationRef.current = conversationId;
      setMessages([]);
      setError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasMore(true);
      setHasShownError(false);
    }
  }, [conversationId]);

  /* 1. Fetch Current User DB ID for correct 'isMe' check */
  const { data: userData } = useQuery(GET_ME, {
    fetchPolicy: "cache-first", // user 'me' doesn't change often
  });
  const currentDbId = userData?.me?.id;

  const normalizeServerMessage = useCallback(
    (msg: MessageInput): LocalMessage => {
      const attachments: MessageAttachment[] | undefined = msg.attachments
        ?.length
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

      // Robust sender check using Database ID
      const msgSenderId =
        (msg as any).senderId ||
        (msg.sender && (msg.sender.id || (msg.sender as any)._id));
      const myId = currentDbId || userId;

      const isMe = !!(
        myId &&
        msgSenderId &&
        msgSenderId.toString() === myId.toString()
      );

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
        sender: isMe ? "seller" : "buyer", // Changed from "user" to "buyer"
        senderId: msgSenderId, // Added senderId
        timestamp,
        status: "sent" as const,
        isRead: !!msg.isRead,
        attachments,
      };
    },
    [userId, currentDbId]
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
          variables: { conversationId, limit: 20, offset: 0 },
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
          // If we got fewer than 20 messages, there's no more to load
          setHasMore(data.messages.length >= 20);
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
    [conversationId, fetchMessages, normalizeServerMessage]
  );

  useEffect(() => {
    loadMessages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  /* Polling removed in favor of Realtime */

  const loadMoreMessages = useCallback(
    async (silent: boolean = false) => {
      if (!conversationId || isLoadingMore || !hasMore) return;

      try {
        setIsLoadingMore(true);
        const currentOffset = messages.length;

        const { data } = await fetchMessages({
          variables: { conversationId, limit: 20, offset: currentOffset },
        });

        if (data?.messages && data.messages.length > 0) {
          const serverMsgs: LocalMessage[] = data.messages
            .map((m: any) => normalizeServerMessage(m))
            .sort(
              (a: LocalMessage, b: LocalMessage) =>
                a.timestamp.getTime() - b.timestamp.getTime()
            );
          setMessages((prev) => {
            const combined = [...serverMsgs, ...prev];
            return combined.sort(
              (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
            );
          });
          // If we got fewer than 20 messages, there's no more to load
          setHasMore(data.messages.length >= 20);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Failed to load more messages:", e);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [conversationId, isLoadingMore, hasMore, messages.length, fetchMessages, normalizeServerMessage]
  );

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.error("Send message error:", error);
    },
  });

  const [markAsReadMutation] = useMutation(MARK_AS_READ, {
    refetchQueries: [
      { query: GET_CONVERSATIONS, variables: { recieverId: userId } },
    ],
  });

  // Mark as read when conversation is active
  useEffect(() => {
    if (conversationId && userId) {
      markAsReadMutation({ variables: { conversationId } }).catch((err) =>
        console.error("[Seller Chat] Failed to mark as read:", err)
      );
    }
  }, [conversationId, userId, markAsReadMutation]);

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

        console.log("sending messages");

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

  // Subscribe to user channel for chat signals
  useRealtime({
    channels: [
      conversationId ? `conversation:${conversationId}` : undefined,
      userId ? `user:${userId}` : undefined,
    ].filter(Boolean) as string[],
    event: "message.newMessage",
    onData: (payload: any) => {
      console.log("[Seller Chat] 📨 New realtime message received:", payload);
      console.log("[Seller Chat] 🔍 Current Conversation ID:", conversationId);
      console.log("[Seller Chat] 👤 Current User ID:", userId);

      if (!payload) return;

      // Prevent cross-talk: Only accept messages for the current conversation if viewing one
      if (
        conversationId &&
        payload.conversationId &&
        payload.conversationId !== conversationId
      ) {
        console.log(
          "[Seller Chat] ⚠️ Message belongs to another conversation. Ignored.",
          payload.conversationId
        );
        return;
      }

      try {
        const normalized = normalizeServerMessage(
          payload as unknown as RealtimeMessageInput
        );
        console.log("[Seller Chat] Normalized message:", normalized);
        upsertServerMessage(normalized);

        // Mark as read only if it's NOT from the current user
        const isFromMe =
          (payload.sender?.id || payload.senderId) === (currentDbId || userId);

        // If we are currently viewing this conversation, mark it as read immediately
        if (
          !isFromMe &&
          conversationId &&
          payload.conversationId === conversationId
        ) {
          markAsReadMutation({ variables: { conversationId } }).catch((err) =>
            console.warn(
              "[Seller Chat] Failed to mark realtime message as read:",
              err
            )
          );
        }
      } catch (err) {
        console.error("[Seller Chat] Error processing message:", err);
      }
    },
  });

  return {
    messages,
    handleSend,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreMessages,
    error,
    refetchMessages: loadMessages,
  };
};
