// File: components/customers/ChatModal.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircleMore, Send, Paperclip, X, File, FileText } from "lucide-react";
import type { LocalMessage as LM, Conversation } from "@/hooks/chat/useSellerChat";
import MessageBubble from "./MessageBubble";

interface SelectedFile {
  file: File;
  preview?: string;
  name: string;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConversationId: string | null;
  messages: LM[];
  onSend: (text: string, files?: File[]) => void;
  isLoading: boolean;
  error: string | null;
  conversation: Conversation[];
}

export default function ChatModal({
  open,
  onOpenChange,
  selectedConversationId,
  messages,
  onSend,
  isLoading,
  conversation,
  error,
}: ChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedConversation = selectedConversationId
    ? conversation.find((c) => c.id === selectedConversationId)
    : null;

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  // auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // focus when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleAttachClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;
    const mapped = files.map((f) => ({
      file: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      name: f.name,
    }));
    setSelectedFiles((prev) => [...prev, ...mapped]);

    // reset input so same file can be selected again
    e.currentTarget.value = "";
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text && selectedFiles.length === 0) return;

    const filesToSend = selectedFiles.map((s) => s.file);
    onSend(text, filesToSend.length ? filesToSend : undefined);

    // revoke previews we created for optimistic UI
    selectedFiles.forEach((s) => {
      if (s.preview) URL.revokeObjectURL(s.preview);
    });

    setInputValue("");
    setSelectedFiles([]);
  }, [inputValue, onSend, selectedFiles]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const disableComposer = isLoading || !selectedConversationId;
  const hasContent = inputValue.trim().length > 0 || selectedFiles.length > 0;

  const getFileIcon = (sf: SelectedFile) => {
    if (sf.preview) return null;
    const nameLower = sf.name.toLowerCase();
    if (sf.file.type === "application/pdf" || nameLower.endsWith(".pdf") || nameLower.endsWith(".doc") || nameLower.endsWith(".docx")) {
      return <FileText className="w-6 h-6 text-muted-foreground" />;
    }
    return <File className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] h-[85vh] sm:h-[600px] max-h-[600px] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
            Chat with {selectedConversation?.reciever?.firstName || "Buyer"}
          </DialogTitle>
          {selectedConversation?.product?.name && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              Regarding: {selectedConversation.product.name}
            </p>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 sm:px-6">
            <div className="py-4 space-y-3 sm:space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground italic">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.clientId ?? message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
          <div className="flex gap-2">
            <Button type="button" onClick={handleAttachClick} disabled={disableComposer} variant="ghost" size="icon" className="shrink-0" aria-label="Attach file">
              <Paperclip className="w-4 h-4" />
            </Button>

            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disableComposer ? "Loading..." : "Type your message..."}
              className="flex-1 text-sm"
              maxLength={500}
              disabled={disableComposer}
            />

            <input ref={fileInputRef} type="file" onChange={handleFileChange} multiple accept="image/*,video/*,application/pdf,.doc,.docx" className="hidden" />

            <Button onClick={handleSendMessage} disabled={!hasContent || disableComposer} size="icon" className="shrink-0" aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {selectedFiles.map((sf, index) => (
                <div key={index} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                  {sf.preview ? (
                    // small preview for images
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sf.preview} alt={sf.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    getFileIcon(sf)
                  )}
                  <span className="text-xs truncate max-w-20">{sf.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(index)} className="h-4 w-4 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {inputValue.length > 400 && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{500 - inputValue.length} characters remaining</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


// File: hooks/chat/useSellerChat.ts
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { useRealtime } from "@upstash/realtime/client";
import { uploadFilesToStorage } from "@/utils/uploadFilesToStorage";

// NOTE: Replace these imports with your actual GraphQL queries/mutations
import { GET_MESSAGES } from "@/client/message/message.query";
import { SEND_MESSAGE } from "@/client/message/message.mutation";

export interface Attachment {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
}

export interface LocalMessage {
  id: string;
  clientId?: string;
  text: string;
  sender: "seller" | "buyer";
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  reciever?: { firstName?: string };
  product?: { name?: string };
}

const NO_CACHE = "no-cache" as const;

export const useSellerChat = (conversationId?: string | null) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastConversationRef = useRef<string | null | undefined>(conversationId);

  // reset when conversation changes
  useEffect(() => {
    if (lastConversationRef.current !== conversationId) {
      lastConversationRef.current = conversationId;
      setMessages([]);
      setError(null);
      setIsLoading(false);
    }
  }, [conversationId]);

  const normalizeServerMessage = useCallback((msg: any): LocalMessage => {
    // robust extraction of text/attachments/timestamp
    const getAttachmentsFrom = (src: any): Attachment[] | undefined => {
      if (!src) return undefined;
      if (Array.isArray(src) && src.length > 0) {
        return src.map((a: any) => ({
          id: a.id ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random())),
          url: a.url ?? a.fileUrl ?? a.file_url,
          type: (a.type === "VIDEO" || (a.url && /\.(mp4|mov|webm)$/i.test(a.url))) ? "VIDEO" : "IMAGE",
        }));
      }
      return undefined;
    };

    let attachments: Attachment[] | undefined;
    attachments = getAttachmentsFrom(msg.attachments) ?? getAttachmentsFrom(msg.MessageAttachment) ?? getAttachmentsFrom(msg.messageAttachment) ?? getAttachmentsFrom(msg.files) ?? undefined;

    // fallback single fileUrl
    if (!attachments && msg.fileUrl) {
      attachments = [{ id: msg.id ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random())), url: msg.fileUrl, type: msg.type === "VIDEO" ? "VIDEO" : "IMAGE" }];
    }

    // text handling: some messages (IMAGE/VIDEO) may carry caption
    const text = msg.type === "TEXT" ? (msg.content ?? "") : (msg.caption ?? (msg.content && typeof msg.content === "string" ? msg.content : ""));

    const normalized: LocalMessage = {
      id: msg.id,
      clientId: msg.clientId ?? undefined,
      text: text ?? "",
      sender: msg.sender?.role === "SELLER" ? "seller" : "buyer",
      timestamp: new Date(msg.sentAt ?? msg.createdAt ?? msg.created_at ?? Date.now()),
      status: "sent",
      attachments: attachments,
    };

    return normalized;
  }, []);

  const upsertServerMessage = useCallback((incoming: LocalMessage) => {
    setMessages((prev) => {
      // dedupe by server id
      const byId = prev.findIndex((m) => m.id === incoming.id);
      if (byId >= 0) {
        const copy = [...prev];
        copy[byId] = { ...copy[byId], ...incoming, status: "sent" };
        return copy.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      }

      // dedupe by clientId (optimistic echo)
      if (incoming.clientId) {
        const byClient = prev.findIndex((m) => m.clientId === incoming.clientId);
        if (byClient >= 0) {
          const copy = [...prev];
          copy[byClient] = { ...copy[byClient], ...incoming, status: "sent" };
          return copy.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        }
      }

      // append
      return [...prev, incoming].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });
  }, []);

  const [fetchMessages] = useLazyQuery(GET_MESSAGES, {
    fetchPolicy: NO_CACHE,
    onError: (e) => console.error("GET_MESSAGES error", e),
  });

  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await fetchMessages({ variables: { conversationId, limit: 50, offset: 0 } });
      if (data?.messages) {
        const normalized = data.messages.map(normalizeServerMessage).sort((a: LocalMessage, b: LocalMessage) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(normalized);
      }
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load messages";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, fetchMessages, normalizeServerMessage]);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    onError: (e) => console.error("SEND_MESSAGE error", e),
  });

  const handleSend = useCallback(
    async (text: string, files?: File[]) => {
      if (!conversationId || (!text.trim() && !files?.length)) return;

      const clientId = typeof crypto !== "undefined" ? crypto.randomUUID() : String(Date.now());

      // optimistic attachments for preview
      const optimisticAttachments = files?.map((f) => ({ id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random()), url: URL.createObjectURL(f), type: f.type.includes("video") ? "VIDEO" as const : "IMAGE" as const })) ?? [];

      const optimisticMsg: LocalMessage = {
        id: clientId,
        clientId,
        text: text.trim(),
        sender: "seller",
        timestamp: new Date(),
        status: "sending",
        attachments: optimisticAttachments.length ? optimisticAttachments : undefined,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setError(null);

      try {
        let uploaded: Array<{ url: string; type: "IMAGE" | "VIDEO" }> | undefined;
        if (files?.length) {
          const tooBig = files.find((f) => f.size > 10 * 1024 * 1024);
          if (tooBig) throw new Error(`\"${tooBig.name}\" exceeds the 10MB limit`);
          uploaded = await uploadFilesToStorage(files);
        }

        const msgType = uploaded?.some((a) => a.type === "VIDEO") ? "VIDEO" : uploaded?.length ? "IMAGE" : "TEXT";

        const { data } = await sendMessageMutation({ variables: { input: { conversationId, content: text.trim() || undefined, type: msgType, attachments: uploaded, clientId } } });

        const serverMsg = data?.sendMessage ?? null;
        if (!serverMsg) throw new Error("No server response");

        // if server doesn't include attachments, ensure we attach uploaded ones
        if (uploaded && (!serverMsg.attachments || serverMsg.attachments.length === 0)) {
          serverMsg.attachments = uploaded.map((u) => ({ id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random()), url: u.url, type: u.type }));
        }

        const normalized = normalizeServerMessage(serverMsg);
        if (!normalized.clientId) normalized.clientId = clientId;
        if (uploaded && !normalized.attachments) {
          normalized.attachments = uploaded.map((a) => ({ id: typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random()), url: a.url, type: a.type }));
        }

        upsertServerMessage(normalized);

        // revoke optimistic blob urls
        optimisticAttachments.forEach((a) => {
          if (a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
        });
      } catch (e: any) {
        console.error("send error", e);
        const msg = e?.message ?? "Failed to send message";
        setError(msg);
        toast.error(msg);
        // mark failed
        setMessages((prev) => prev.map((m) => (m.clientId === clientId ? { ...m, status: "failed" } : m)));
      }
    },
    [conversationId, sendMessageMutation, normalizeServerMessage, upsertServerMessage]
  );

  // realtime handler
  const handleRealtime = useCallback((payload: any) => {
    if (!payload) return;
    const normalized = normalizeServerMessage(payload);
    upsertServerMessage(normalized);
  }, [normalizeServerMessage, upsertServerMessage]);

  const events = useMemo(
    () => ({ message: { newMessage: handleRealtime } }),
    [handleRealtime]
  );

  useRealtime({ channel: conversationId ? `conversation:${conversationId}` : undefined, events });

  // cleanup blob urls when messages are removed / component unmount
  useEffect(() => {
    return () => {
      messages.forEach((m) => {
        m.attachments?.forEach((a) => {
          if (a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
        });
      });
    };
  }, [messages]);

  return {
    messages,
    handleSend,
    isLoading,
    error,
    refetchMessages: loadMessages,
  };
};


// File: components/customers/MessageBubble.tsx
"use client";

import React from "react";
import type { LocalMessage } from "@/hooks/chat/useSellerChat";

const MessageBubble: React.FC<{ message: LocalMessage }> = ({ message }) => {
  const isSeller = message.sender === "seller";

  return (
    <div className={`flex ${isSeller ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] p-2 rounded-lg ${isSeller ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
        {message.text && <div className="text-sm whitespace-pre-wrap">{message.text}</div>}

        {message.attachments && (
          <div className="mt-2 flex flex-col gap-2">
            {message.attachments.map((a) => (
              <div key={a.id} className="rounded overflow-hidden">
                {a.type === "IMAGE" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt="attachment" className="max-w-full h-auto rounded" />
                ) : (
                  <video controls className="max-w-full h-auto rounded">
                    <source src={a.url} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-[10px] text-muted-foreground text-right mt-1">{message.status === "sending" ? "Sending..." : message.status === "failed" ? "Failed" : new Date(message.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
