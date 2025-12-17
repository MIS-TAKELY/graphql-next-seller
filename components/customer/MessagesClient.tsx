"use client";

import { GET_CONVERSATIONS } from "@/client/conversatation/conversatation.query";
import { useQuery } from "@apollo/client";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import MessagesSection from "./MessagesSection";
import { useConversationRealtime } from "@/hooks/chat/useConversationRealtime";

export default function MessagesClient() {
  const { userId, isLoaded } = useAuth();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const { data, loading, error, refetch } = useQuery(GET_CONVERSATIONS, {
    variables: { recieverId: userId },
    skip: !isLoaded || !userId,
    fetchPolicy: "cache-and-network",
  });

  // Listen for real-time updates to refresh the conversation list
  useConversationRealtime(() => {
    refetch();
  });

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading messages</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const conversations = data?.conversations || [];

  return (
    <MessagesSection
      conversations={conversations}
      convLoading={loading}
      recieverId={userId || ""}
      customerId={customerId}
    />
  );
}

