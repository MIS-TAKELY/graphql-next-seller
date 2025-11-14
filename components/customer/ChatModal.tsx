// components/customers/ChatModal.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/types/customer/customer.types";
import { MessageCircleMore, Send, Paperclip, X, File, FileText } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { LocalMessage } from "@/hooks/chat/useChat";

interface SelectedFile {
  file: File;
  preview?: string;
  name: string;
}

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConversationId: string | null;
  messages: LocalMessage[];
  onSend: (text: string, files?: File[]) => void;
  isLoading: boolean;
  error: string | null;
  recieverId: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedConversation = selectedConversationId
    ? conversation.find((c) => c.id === selectedConversationId)
    : null;

  useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        if (preview) URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (open && messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newFilesWithPreview: SelectedFile[] = newFiles.map((file) => {
        let preview: string | undefined = undefined;
        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          preview = URL.createObjectURL(file);
        }
        return { file, preview, name: file.name };
      });
      setSelectedFiles((prev) => [...prev, ...newFilesWithPreview]);
      e.target.value = "";
    }
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, [selectedFiles]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed && selectedFiles.length === 0) return;
    const filesToSend = selectedFiles.map((sf) => sf.file);
    onSend(trimmed, filesToSend);
    selectedFiles.forEach(({ preview }) => {
      if (preview) URL.revokeObjectURL(preview);
    });
    setInputValue("");
    setSelectedFiles([]);
  }, [inputValue, selectedFiles, onSend]);

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
  const hasContent = inputValue.trim() || selectedFiles.length > 0;

  const getFileIcon = (sf: SelectedFile) => {
    if (sf.preview) return null;
    const nameLower = sf.name.toLowerCase();
    if (nameLower.endsWith(".pdf") || nameLower.endsWith(".doc") || nameLower.endsWith(".docx")) {
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
              {isLoading && messages.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground italic">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.clientId ?? message.id}
                    message={message}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAttachClick}
              disabled={disableComposer}
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Attach file"
            >
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
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*,application/pdf,.doc,.docx"
              className="hidden"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!hasContent || disableComposer}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {selectedFiles.map((sf, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-muted rounded-md px-2 py-1"
                >
                  {sf.preview ? (
                    sf.file.type.startsWith("image/") ? (
                      <img
                        src={sf.preview}
                        alt={sf.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : sf.file.type.startsWith("video/") ? (
                      <video
                        src={sf.preview}
                        className="w-6 h-6 object-cover rounded"
                      />
                    ) : (
                      getFileIcon(sf)
                    )
                  ) : (
                    getFileIcon(sf)
                  )}
                  <span className="text-xs truncate max-w-20">{sf.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {inputValue.length > 400 && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {500 - inputValue.length} characters remaining
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};