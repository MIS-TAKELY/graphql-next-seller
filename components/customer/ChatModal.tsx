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
import { LocalMessage } from "@/hooks/chat/useChat";
import { Conversation } from "@/types/customer/customer.types";
import { MessageCircleMore, Send } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedConversationId: string | null;
  messages: LocalMessage[];
  onSend: (text: string) => void;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  console.log("selectedConversationId---->", selectedConversationId);
  console.log("conversation---->", conversation);

  // Compute the selected conversation from the array
  const selectedConversation = selectedConversationId
    ? conversation.find((c) => c.id === selectedConversationId)
    : null;

  console.log("selectedConversation---->", selectedConversation);
  console.log("messages in modal---->", messages);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (open && inputRef.current) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onSend(trimmed);
      setInputValue("");
    }
  }, [inputValue, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

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
                <p className="text-center text-muted-foreground">
                  Loading messages...
                </p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground italic">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="border-t px-4 sm:px-6 py-3 sm:py-4 shrink-0 bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Loading..." : "Type your message..."}
              className="flex-1 text-sm"
              maxLength={500}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {inputValue.length > 400 && (
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {500 - inputValue.length} characters remaining
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
