import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/types/customer/customer.types";
import { formatDistanceToNow } from "date-fns";
import { ShoppingBag } from "lucide-react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
  currentUserId,
}: ConversationItemProps) {
  // Determine the "Other" person
  const otherUser =
    conversation.sender?.id === currentUserId
      ? conversation.reciever
      : conversation.sender;

  const name = otherUser?.firstName || "Unknown User";
  const lastMessage = conversation.lastMessage; // Adjusted to match type definition
  const lastMessageText =
    lastMessage?.content ||
    (lastMessage?.fileUrl ? "Sent an attachment" : "No messages yet");
  const timeAgo = lastMessage?.createdAt // Message (from types) extends BaseEntity which has createdAt
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false })
    : "";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200 border border-transparent",
        isActive
          ? "bg-primary/10 border-primary/20 shadow-sm"
          : "hover:bg-muted/50 hover:border-border/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
          <AvatarImage src={(otherUser as any)?.avatar || (otherUser as any)?.avatarImageUrl} />
          <AvatarFallback
            className={cn(
              isActive ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            {name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Online status indicator (mocked for now) */}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start">
          <span
            className={cn(
              "font-semibold text-sm truncate",
              isActive && "text-primary"
            )}
          >
            {name}
          </span>
          {timeAgo && (
            <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
              {timeAgo.replace("about", "")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {conversation.product?.name && (
            <div className="flex items-center gap-1 shrink-0 max-w-[40%] bg-muted px-1.5 py-0.5 rounded">
              <ShoppingBag className="w-3 h-3" />
              <span className="truncate">{conversation.product.name}</span>
            </div>
          )}
          <span className="truncate flex-1">
            {/* Prefix "You:" if the user sent the last message */}
            {lastMessage?.senderId === currentUserId && "You: "}
            {lastMessageText}
          </span>
        </div>
      </div>
    </button>
  );
}
