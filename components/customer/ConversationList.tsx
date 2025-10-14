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

  return (
    <div
      className="flex items-start space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-muted"
      onClick={() => onSelect(conversation.id)}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          {conversation?.reciever?.firstName}
          {conversation?.reciever?.lastName}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="font-medium">
              {conversation?.reciever?.firstName} {conversation?.reciever?.lastName}
            </p>
            <Badge variant="outline">{conversation?.product?.name}</Badge>
            {unreadBadge}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(conversation?.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {conversation?.lastMessage?.content || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

export default ConversationList;
