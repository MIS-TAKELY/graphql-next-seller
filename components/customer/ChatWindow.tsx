"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocalMessage } from "@/hooks/chat/useChat";
import { Conversation } from "@/types/customer/customer.types";
import {
  ArrowLeft,
  FileText,
  Loader2,
  MoreVertical,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  conversation?: Conversation;
  messages: LocalMessage[];
  onSend: (text: string, files?: File[]) => void;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  error: string | null;
  onBack: () => void;
  currentUserId: string;
}

interface SelectedFile {
  file: File;
  preview?: string;
  name: string;
}

export default function ChatWindow({
  conversation,
  messages,
  onSend,
  isLoading,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  error,
  onBack,
  currentUserId,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversation?.id]);

  // Handle scroll to load more messages
  useEffect(() => {
    if (!scrollAreaRef.current || !onLoadMore) return;

    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const handleScroll = () => {
      const scrollTop = viewport.scrollTop;

      // If user scrolled to top (within 50px) and there are more messages to load
      if (scrollTop < 50 && hasMore && !isLoadingMore) {
        // Store current scroll height before loading
        previousScrollHeightRef.current = viewport.scrollHeight;
        onLoadMore();
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Preserve scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && previousScrollHeightRef.current > 0 && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const newScrollHeight = scrollContainer.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeightRef.current;
        scrollContainer.scrollTop = scrollDiff;
        previousScrollHeightRef.current = 0;
      }
    }
  }, [isLoadingMore]);

  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newFilesWithPreview = newFiles.map((file) => ({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
        name: file.name,
      }));
      setSelectedFiles((prev) => [...prev, ...newFilesWithPreview]);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    const file = selectedFiles[index];
    if (file.preview) URL.revokeObjectURL(file.preview);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return;
    onSend(
      inputValue.trim(),
      selectedFiles.map((f) => f.file)
    );
    setInputValue("");
    setSelectedFiles([]);
  };

  const partner =
    conversation?.sender?.id === currentUserId
      ? conversation?.reciever
      : conversation?.sender;

  const partnerName = partner?.firstName || "User";
  const productName = conversation?.product?.name;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 bg-card/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden -ml-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Avatar className="h-9 w-9 border">
            <AvatarImage src={(partner as any)?.avatar || (partner as any)?.avatarImageUrl} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {partnerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-none">
              {partnerName}
            </span>
            {productName && (
              <span className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                Re: {productName}
              </span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Product</DropdownMenuItem>
            <DropdownMenuItem>Report User</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/5">
        <ScrollArea ref={scrollAreaRef} className="h-full px-4">
          <div className="py-6 space-y-6">
            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="flex justify-center items-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Loading older messages...</span>
              </div>
            )}

            {isLoading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-xs">Loading history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-primary/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-primary/60" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Start a conversation with <strong>{partnerName}</strong>
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                // Check if previous message was from same sender to group visually
                const isSequence =
                  i > 0 && messages[i - 1].sender === msg.sender;
                return (
                  <div
                    key={msg.clientId || msg.id}
                    className={isSequence ? "mt-1" : "mt-4"}
                  >
                    <MessageBubble
                      message={msg}
                      isOwn={msg.sender === "seller"}
                    />
                  </div>
                );
              })
            )}
            {error && (
              <div className="text-center p-2 bg-destructive/10 text-destructive text-xs rounded mx-auto max-w-xs">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background shrink-0">
        {/* File Preview */}
        {selectedFiles.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {selectedFiles.map((sf, index) => (
              <div key={index} className="relative group shrink-0">
                <div className="w-16 h-16 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                  {sf.preview ? (
                    <img
                      src={sf.preview}
                      className="w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end bg-muted/30 p-1.5 rounded-xl border focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={handleAttachClick}
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />

          <Input
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1 min-h-[36px] max-h-[120px] py-2"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
            disabled={isLoading}
            autoComplete="off"
          />

          <Button
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg transition-all",
              inputValue.trim() || selectedFiles.length > 0
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={handleSendMessage}
            disabled={
              isLoading || (!inputValue.trim() && selectedFiles.length === 0)
            }
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
