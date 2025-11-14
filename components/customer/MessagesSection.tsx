// components/customers/MessagesSection.tsx (Client Component)
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSellerChat } from "@/hooks/chat/useChat";
import { Conversation } from "@/types/customer/customer.types";
import { Loader2, MessageCircleMore } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ChatModal from "./ChatModal";
import ConversationList from "./ConversationList";

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
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [showChat, setShowChat] = useState(false);

  const handleOpenChat = useCallback((convId: string) => {
    setSelectedConversationId(convId);
    setShowChat(true);
  }, []);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setSelectedConversationId(null);
  }, []);

  const {
    messages,
    handleSend,
    isLoading: chatLoading,
    error: chatError,
    refetchMessages,
  } = useSellerChat(selectedConversationId);

  // Refetch messages when conversation changes (only show loading on first open)
  useEffect(() => {
    if (selectedConversationId && refetchMessages && showChat) {
      // Show loading only when chat first opens, not on subsequent updates
      refetchMessages(false); // false = show loading
    }
  }, [selectedConversationId, showChat]); // Removed refetchMessages from deps to avoid unnecessary refetches

  // Filter conversations by customerId if provided
  const filteredConversations = customerId
    ? conversations.filter((conv: any) => conv.sender?.id === customerId)
    : conversations;

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300">
          Messages
        </h2>
      </div>
      <Card className="transition-all duration-300 ease-in-out hover:shadow-md">
        <CardHeader className="pb-3 sm:pb-4 transition-all duration-300">
          <CardTitle className="text-base sm:text-lg md:text-xl transition-all duration-300">
            Customer Messages
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm transition-all duration-300">
            Manage conversations with buyers in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="transition-all duration-300">
          <div className="space-y-4">
            {convLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-muted-foreground">
                  Loading conversations...
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 transition-all duration-300">
                <MessageCircleMore className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-base sm:text-lg font-semibold transition-all duration-300">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground transition-all duration-300">
                  Start chatting with buyers!
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation: any) => (
                <div key={conversation.id} className="transition-all duration-300">
                  <ConversationList
                    conversation={conversation}
                    onSelect={handleOpenChat}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ChatModal
        open={showChat}
        onOpenChange={handleCloseChat}
        selectedConversationId={selectedConversationId}
        messages={messages}
        onSend={handleSend}
        isLoading={chatLoading}
        error={chatError}
        conversation={filteredConversations}
        recieverId={recieverId}
      />
    </div>
  );
}
