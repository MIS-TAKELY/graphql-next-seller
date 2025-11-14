// components/customers/ConversationList.tsx (Reusable Component; can be server if no interactivity)
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Conversation } from "@/types/customer/customer.types";
import React from "react";

interface ConversationListProps {
  conversation: Conversation;
  onSelect: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversation,
  onSelect,
}) => {
  const unreadBadge = conversation.unreadCount > 0 && (
    <Badge variant="destructive" className="ml-2">
      {conversation.unreadCount}
    </Badge>
  );

  console.log("conversation--->",conversation)

  const getInitials = () => {
    const first = conversation?.sender?.firstName?.[0] || "";
    const last = conversation?.sender?.lastName?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  return (
    <div
      className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg cursor-pointer hover:bg-muted transition-all duration-300 ease-in-out"
      onClick={() => onSelect(conversation.id)}
    >
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300">
        <AvatarFallback className="text-xs sm:text-sm">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <p className="font-medium text-xs sm:text-sm truncate">
              {conversation?.sender?.firstName || ""} {conversation?.sender?.lastName || ""}
            </p>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {conversation?.product?.name}
            </Badge>
            {unreadBadge}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(conversation?.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground truncate">
          {conversation?.lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

export default ConversationList;
