import { GET_MESSAGES } from "@/client/message/message.query";
import { SEND_MESSAGE } from "@/client/message/message.mutation";
import { RealtimeEvents } from "@/lib/realtime";
import { useMutation, useQuery } from "@apollo/client";
import { useRealtime } from "@upstash/realtime/client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface LocalMessage {
  id: string;
  text: string;
  sender: "seller" | "buyer";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Array<{ id: string; url: string; type: "IMAGE" | "VIDEO" }>;
}

export const useSellerChat = (conversationId?: string | null) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasShownError, setHasShownError] = useState(false); // Prevent repeated toasts

  const {
    data: messagesData,
    error: messageError,
    refetch: refetchMessages,
  } = useQuery(GET_MESSAGES, {
    variables: { conversationId },
    skip: !conversationId,
    onCompleted: (data) => {
      setMessages(
        data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content || "",
          sender: msg.sender.role === "SELLER" ? "seller" : "buyer",
          timestamp: new Date(msg.sentAt),
          status: "sent",
          attachments:
            msg.attachments ||
            (msg.fileUrl
              ? [
                  {
                    id: msg.id,
                    url: msg.fileUrl,
                    type: msg.type as "IMAGE" | "VIDEO",
                  },
                ]
              : []),
        }))
      );
    },
  });

  // Handle message error in useEffect to avoid infinite re-renders
  useEffect(() => {
    if (messageError && !hasShownError) {
      setError(messageError.message);
      toast.error(messageError.message);
      setHasShownError(true);
    }
  }, [messageError, hasShownError]);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: (data) => {
      const newMsg = data.sendMessage;
      setMessages((prev) => [
        ...prev,
        {
          id: newMsg.id,
          text: newMsg.content || "",
          sender: newMsg.sender.role === "SELLER" ? "seller" : "buyer",
          timestamp: new Date(newMsg.sentAt),
          status: "sent",
          attachments: newMsg.attachments || [],
        },
      ]);
      setError(null);
      setHasShownError(false); // Reset for future errors
    },
    onError: (err) => {
      setError(err.message);
      toast.error(err.message);
      setHasShownError(true);
    },
  });

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId || (!text.trim() && !files?.length)) return;

      const optimisticMsg: LocalMessage = {
        id: crypto.randomUUID(),
        text: text.trim(),
        sender: "seller",
        timestamp: new Date(),
        status: "sending",
        attachments:
          files?.map((file) => ({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(file),
            type: file.type.includes("image") ? "IMAGE" : "VIDEO",
          })) || [],
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      try {
        if (!files?.length) {
          await sendMessage({
            variables: {
              input: {
                conversationId,
                content: text.trim(),
                type: "TEXT",
              },
            },
          });
          return;
        }

        // TODO: Implement file upload to your storage (e.g., S3 via API) and get uploaded attachments
        const uploadedAttachments:any = [];
        await sendMessage({
          variables: {
            input: {
              conversationId,
              content: text.trim(),
              type: "IMAGE", // Dynamic based on files
              attachments: uploadedAttachments,
            },
          },
        });
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id ? { ...m, status: "failed" } : m
          )
        );
        setError(err.message);
      }
    },
    [conversationId, sendMessage]
  );

  // Real-time subscription
  useRealtime<RealtimeEvents>({
    channel: conversationId ? `conversation:${conversationId}` : undefined,
    events: {
      message: {
        newMessage: (payload) => {
          const newMsg = payload;
          console.log("message-->", newMsg);
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              text: newMsg.content || "",
              sender: newMsg.sender.role === "SELLER" ? "seller" : "buyer",
              timestamp: new Date(newMsg.sentAt),
              status: "sent",
              attachments: newMsg.attachments || [],
            },
          ]);
        },
      },
    },
  });

  return {
    messages,
    handleSend,
    isLoading,
    error,
    refetchMessages,
  };
};
