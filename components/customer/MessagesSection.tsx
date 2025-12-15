"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSellerChat } from "@/hooks/chat/useChat";
import { Conversation } from "@/types/customer/customer.types";
import { cn } from "@/lib/utils";
import { Loader2, Search, MessageSquareOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChatWindow from "./ChatWindow"; // Renamed from ChatModal
import ConversationItem from "./ConversationItem"; // New extracted component

interface MessagesSectionProps {
  conversations: Conversation[];
  convLoading: boolean;
  recieverId: string;
  customerId?: string | null;
}

export default function MessagesSection({
  conversations,
  convLoading,
  recieverId,
  customerId,
}: MessagesSectionProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view to handle navigation logic
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const {
    messages,
    handleSend,
    isLoading: chatLoading,
    error: chatError,
    refetchMessages,
  } = useSellerChat(selectedConversationId);

  useEffect(() => {
    if (selectedConversationId && refetchMessages) {
      refetchMessages(false);
    }
  }, [selectedConversationId]);

  const filteredConversations = conversations
    .filter((conv) => {
      // Filter by customerId param if exists
      if (customerId && conv.sender?.id !== customerId) return false;
      
      // Filter by search query
      if (!searchQuery) return true;
      const name = conv.reciever?.firstName || conv.sender?.firstName || "";
      const product = conv.product?.name || "";
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleBackToMenu = () => {
    setSelectedConversationId(null);
  };

  // Derived state to control what is visible on mobile
  const showList = !isMobileView || !selectedConversationId;
  const showChat = !isMobileView || selectedConversationId;

  return (
    <div className="h-[calc(100vh-120px)] min-h-[500px] max-h-[900px] w-full flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Sidebar - Conversation List */}
      <Card className={cn(
        "flex flex-col h-full border-border/60 shadow-sm transition-all duration-300",
        "w-full md:w-[320px] lg:w-[380px] shrink-0",
        !showList && "hidden md:flex"
      )}>
        <CardHeader className="px-4 py-3 border-b space-y-3">
          <CardTitle className="text-xl font-bold tracking-tight">Messages</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1">
              {convLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading chats...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <p className="text-sm text-muted-foreground">No conversations found.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={selectedConversationId === conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    currentUserId={recieverId}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Right Side - Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col h-full border-border/60 shadow-sm overflow-hidden",
        !showChat && "hidden md:flex"
      )}>
        {selectedConversationId ? (
          <ChatWindow
            conversation={filteredConversations.find(c => c.id === selectedConversationId)}
            messages={messages}
            onSend={handleSend}
            isLoading={chatLoading}
            error={chatError}
            onBack={handleBackToMenu} // Only used on mobile
            currentUserId={recieverId}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 bg-muted/10">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No chat selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Choose a conversation from the list to start chatting with buyers or sellers.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}