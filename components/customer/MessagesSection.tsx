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
import { TabsContent } from "@radix-ui/react-tabs";
import { Loader2, MessageCircleMore } from "lucide-react";
import { useCallback, useState } from "react";
import ChatModal from "./ChatModal";
import ConversationList from "./ConversationList";

interface MessagesSectionProps {
  conversations: Conversation[];
  convLoading: boolean;
  recieverId: string;
}

export default function MessagesSection({
  conversations,
  convLoading,
  recieverId,
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
  } = useSellerChat(selectedConversationId);
  console.log("messages-->", messages);
  return (
    <TabsContent value="messages" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Customer Messages</CardTitle>
          <CardDescription>
            Manage conversations with buyers in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {convLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-muted-foreground">
                  Loading conversations...
                </p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircleMore className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No conversations yet
                </h3>
                <p className="text-muted-foreground">
                  Start chatting with buyers!
                </p>
              </div>
            ) : (
              conversations.map((conversation: any) => (
                <ConversationList
                  key={conversation.id}
                  conversation={conversation}
                  onSelect={handleOpenChat}
                />
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
        conversation={conversations}
        recieverId={recieverId}
      />
    </TabsContent>
  );
}
