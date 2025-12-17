// hooks/chat/useRealChat.ts
"use client";

import { CREATE_CONVERSATION } from "@/client/conversatation/conversatatioln.mutatio";
import {
    GET_CONVERSATION_BY_PRODUCT,
    GET_ALL_CONVERSATIONS
} from "@/client/conversatation/conversatation.query";
import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { GET_MESSAGES } from "@/client/message/message.query";
import { NewMessagePayload } from "@/lib/realtime";
import { uploadFilesToStorage } from "@/utlis/uploadFilesToStorage";
import {
    ApolloError,
    FetchPolicy,
    useLazyQuery,
    useMutation,
} from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Re-using types from existing project or defining local equivalents to match seller pattern
import { LocalMessage, MessageType, MessageAttachment } from "@/types/chat";

// Define internal types to match logic if strict types aren't available yet
interface ServerMessage {
    id: string;
    senderId: string;
    content?: string | null;
    fileUrl?: string | null;
    type?: string | MessageType;
    attachments?: Array<{
        id?: string;
        url: string;
        type: string;
    }>;
    createdAt: Date | string;
    updatedAt: Date | string;
    sender?: {
        id: string;
        roles?: Array<{ role: string }>;
    };
}

const FETCH_POLICY_NO_CACHE: FetchPolicy = "no-cache";

export const useRealChat = (
    productId?: string,
    currentUserId?: string,
    initialConversationId?: string,
    onMessageReceived?: () => void
) => {
    const { userId: clerkId } = useAuth();
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasShownError, setHasShownError] = useState(false);

    const isInitializingRef = useRef(false);
    const hasInitializedRef = useRef(false);
    const lastProductIdRef = useRef<string | undefined>(productId);
    const lastConvIdRef = useRef<string | undefined>(initialConversationId);

    const [getConversation] = useLazyQuery(GET_CONVERSATION_BY_PRODUCT, {
        fetchPolicy: FETCH_POLICY_NO_CACHE,
    });

    const [fetchMessages] = useLazyQuery(GET_MESSAGES, {
        fetchPolicy: FETCH_POLICY_NO_CACHE,
        onError: (error) => {
            console.error("Failed to fetch messages:", error);
        },
    });

    const [createConversation] = useMutation(CREATE_CONVERSATION);

    const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
        onError: (error) => {
            console.error("Send message error:", error);
        },
        refetchQueries: [GET_ALL_CONVERSATIONS],
    });

    // Reset state when product or conversation ID changes
    useEffect(() => {
        if (lastProductIdRef.current !== productId || lastConvIdRef.current !== initialConversationId) {
            lastProductIdRef.current = productId;
            lastConvIdRef.current = initialConversationId;
            setConversationId(initialConversationId || null);
            setMessages([]);
            setError(null);
            setIsLoading(false);
            setHasShownError(false);
            hasInitializedRef.current = false;
        }
    }, [productId, initialConversationId]);

    const normalizeMessage = useCallback(
        (msg: any): LocalMessage => {
            // Logic to resolve timestamp
            const rawDate = msg.sentAt || msg.createdAt || msg.updatedAt || new Date();
            const timestamp = new Date(rawDate);

            let attachments: MessageAttachment[] | undefined;

            if (msg.attachments?.length) {
                attachments = msg.attachments.map((a: any) => ({
                    id: a.id || crypto.randomUUID(),
                    url: a.url || a.fileUrl,
                    type: (a.type as MessageType) || "IMAGE",
                }));
            } else if (msg.fileUrl) {
                attachments = [
                    {
                        id: crypto.randomUUID(),
                        url: msg.fileUrl,
                        type: (msg.type as MessageType) || "IMAGE",
                    },
                ];
            }

            // Determine sender
            const isMe =
                (msg.sender?.id && msg.sender.id === currentUserId) ||
                msg.senderId === currentUserId;

            return {
                id: msg.id || crypto.randomUUID(),
                clientId: msg.clientId,
                text: msg.content || "",
                sender: isMe ? "user" : "seller",
                senderId: msg.sender?.id || msg.senderId,
                timestamp,
                status: "sent",
                attachments,
            };
        },
        [currentUserId]
    );

    const upsertMessage = useCallback((incoming: LocalMessage) => {
        setMessages((prev) => {
            const cleanBlobs = (msg: LocalMessage) => {
                msg.attachments?.forEach((a) => {
                    if (a.url.startsWith("blob:")) {
                        URL.revokeObjectURL(a.url);
                    }
                });
            };

            const updated = [...prev];
            const byServerId = updated.findIndex((m) => m.id === incoming.id && m.id); // Valid server ID check

            if (byServerId >= 0) {
                cleanBlobs(updated[byServerId]);
                updated[byServerId] = {
                    ...updated[byServerId],
                    ...incoming,
                    clientId: updated[byServerId].clientId ?? incoming.clientId,
                    status: "sent",
                };
                return updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }

            if (incoming.clientId) {
                const byClientId = updated.findIndex(
                    (m) => m.clientId === incoming.clientId
                );
                if (byClientId >= 0) {
                    cleanBlobs(updated[byClientId]);
                    updated[byClientId] = { ...updated[byClientId], ...incoming, status: "sent" };
                    return updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                }
            }

            // Fallback match by details (timestamp proximity + sender) for optimistic updates relying on non-clientId backend ref
            // Only if status is sending to avoid false positives
            const candidateIndex = [...updated]
                .map((m, i) => ({ m, i }))
                .reverse()
                .find(
                    ({ m }) =>
                        m.status === "sending" &&
                        m.sender === incoming.sender &&
                        Math.abs(m.timestamp.getTime() - incoming.timestamp.getTime()) < 5000
                )?.i;

            if (candidateIndex !== undefined) {
                cleanBlobs(updated[candidateIndex]);
                updated[candidateIndex] = {
                    ...updated[candidateIndex],
                    ...incoming,
                    status: "sent"
                };
                return updated.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            }

            return [...updated, incoming].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        });
    }, []);

    const initializeChat = useCallback(async () => {
        if (
            (!productId && !initialConversationId) ||
            !currentUserId ||
            isInitializingRef.current ||
            hasInitializedRef.current
        )
            return;

        try {
            isInitializingRef.current = true;
            setIsLoading(true);
            setError(null);

            let convId = initialConversationId;

            if (!convId && productId) {
                const { data: convData } = await getConversation({
                    variables: { productId },
                });
                convId = convData?.conversationByProduct?.id;

                if (!convId) {
                    try {
                        const { data: createData } = await createConversation({
                            variables: { input: { productId } },
                        });
                        convId = createData?.createConversation?.id;
                    } catch (err) {
                        console.error("Creation failed", err);
                    }
                }
            }

            if (!convId) throw new Error("Could not start conversation");

            setConversationId(convId);
            hasInitializedRef.current = true;

            // Initial load
            const { data: msgData } = await fetchMessages({
                variables: { conversationId: convId, limit: 50, offset: 0 },
            });

            if (msgData?.messages) {
                const normalized = msgData.messages.map(normalizeMessage);
                setMessages(
                    normalized.sort(
                        (a: any, b: any) => a.timestamp.getTime() - b.timestamp.getTime()
                    )
                );
            }
        } catch (e: any) {
            console.error(e);
            const msg = e.message || "Failed to load chat";
            setError(msg);
            toast.error("Chat Error: " + msg);
        } finally {
            setIsLoading(false);
            isInitializingRef.current = false;
        }
    }, [
        productId,
        initialConversationId,
        currentUserId,
        getConversation,
        createConversation,
        fetchMessages,
        normalizeMessage,
    ]);




    const handleSend = useCallback(
        async (text: string, files: File[] = []) => {
            if (!conversationId || (!text.trim() && !files.length)) return;

            const clientId = crypto.randomUUID();

            // Optimistic Update
            const optimisticAttachments: MessageAttachment[] = files.map((f) => ({
                id: crypto.randomUUID(),
                url: URL.createObjectURL(f),
                type: (f.type.startsWith("video/")
                    ? "VIDEO"
                    : f.type.startsWith("image/")
                        ? "IMAGE"
                        : "DOCUMENT") as MessageType,
            }));

            const optimisticMsg: LocalMessage = {
                id: clientId,
                clientId,
                text: text.trim(),
                sender: "user",
                senderId: currentUserId,
                timestamp: new Date(),
                status: "sending",
                attachments: optimisticAttachments.length
                    ? optimisticAttachments
                    : undefined,
            };

            setMessages((prev) => [...prev, optimisticMsg]);
            setError(null);

            try {
                const tooBig = files.find((f) => f.size > 10 * 1024 * 1024);
                if (tooBig) throw new Error(`"${tooBig.name}" exceeds 10MB limit`);

                let uploaded: { url: string; type: "IMAGE" | "VIDEO" | "DOCUMENT" }[] | undefined;

                if (files.length) {
                    uploaded = await uploadFilesToStorage(files);
                }

                let type = "TEXT";
                if (uploaded?.length) {
                    if (uploaded.some(u => u.type === 'VIDEO')) type = "VIDEO";
                    else type = "IMAGE";
                }

                const { data } = await sendMessageMutation({
                    variables: {
                        input: {
                            conversationId,
                            content: text.trim() || undefined,
                            type,
                            clientId,
                            attachments: uploaded,
                        },
                    },
                });

                if (data?.sendMessage) {
                    const normalized = normalizeMessage(data.sendMessage);
                    // Force sender to be 'user' since we just sent it
                    upsertMessage({ ...normalized, clientId, sender: "user" });
                } else {
                    throw new Error("No response from server");
                }

                // Revoke optimistic blobs
                optimisticAttachments.forEach((a) => URL.revokeObjectURL(a.url));

            } catch (e: any) {
                console.error(e);
                const msg = e.message || "Failed to send message";
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
            currentUserId,
            sendMessageMutation,
            normalizeMessage,
            upsertMessage,
        ]
    );

    // Unified Realtime Subscription
    useRealtime({
        channels: [
            conversationId ? `conversation:${conversationId}` : undefined,
            clerkId ? `user:${clerkId}` : undefined
        ].filter(Boolean) as string[],
        event: "message.newMessage",
        onData: (payload: any) => {
            console.log("[SELLER] 📨 New realtime message received:", payload);
            console.log("[SELLER] 🔍 Current Conversation ID:", conversationId);
            console.log("[SELLER] 👤 Current User ID:", clerkId);

            if (!payload) return;

            // Verify if this message belongs to the current conversation
            if (payload.conversationId && conversationId && payload.conversationId !== conversationId) {
                console.log("[SELLER] ⚠️ Message belongs to another conversation:", payload.conversationId);
                // We might still want to notify, but maybe not upsert if we are strictly viewing one conv?
                // But upsertMessage usually handles ID checks or we want to see it if it's relevant.
                // For now, let's process it and let upsert handle logic.
            }

            const normalized = normalizeMessage(payload);
            upsertMessage(normalized);
            if (onMessageReceived) {
                onMessageReceived();
            }
        },
    });

    return {
        conversationId,
        messages,
        initializeChat,
        handleSend,
        isLoading,
        error,
    };
};