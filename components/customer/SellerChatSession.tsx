"use client";

import { useSellerChat } from "@/hooks/chat/useChat";
import ChatWindow from "./ChatWindow";
import { Conversation } from "@/types/customer/customer.types";
import { useEffect } from "react";

interface SellerChatSessionProps {
    conversation: Conversation;
    recieverId: string;
    onBack: () => void;
}

export function SellerChatSession({
    conversation,
    recieverId,
    onBack,
}: SellerChatSessionProps) {
    // Hook initialized freshly on mount because parent keys this component
    const {
        messages,
        handleSend,
        isLoading,
        isLoadingMore,
        hasMore,
        loadMoreMessages,
        error,
        refetchMessages,
    } = useSellerChat(conversation.id);

    useEffect(() => {
        // Ensure messages are fetched on mount (redundant but safe)
        if (conversation.id && refetchMessages) {
            refetchMessages(false);
        }
    }, [conversation.id, refetchMessages]);

    return (
        <ChatWindow
            conversation={conversation}
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={loadMoreMessages}
            error={error}
            onBack={onBack}
            currentUserId={recieverId}
        />
    );
}
