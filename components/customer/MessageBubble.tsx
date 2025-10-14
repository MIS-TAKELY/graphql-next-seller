// components/customers/MessageBubble.tsx (Reusable Memoized Component)
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocalMessage } from "@/hooks/chat/useChat";
import { cn } from "@/lib/utils";
import React from "react";

interface MessageBubbleProps {
  message: LocalMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message }) => (
    <div
      className={cn(
        "flex gap-2",
        message.sender === "seller" ? "justify-end" : "justify-start"
      )}
    >
      {message.sender === "buyer" && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">B</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl break-words",
          message.sender === "seller"
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text}
        </p>
        {message && message?.attachments!?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message?.attachments?.map((att: any) => (
              <div key={att.id} className="w-16 h-16 rounded">
                {att.type === "VIDEO" ? (
                  <video
                    src={att.url}
                    className="w-full h-full object-cover rounded"
                    controls
                  />
                ) : (
                  <img
                    src={att.url}
                    alt=""
                    className="w-full h-full object-cover rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <p
          className={cn(
            "text-[10px] sm:text-xs mt-1",
            message.sender === "seller"
              ? "text-primary-foreground/70"
              : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.status === "sending" && " • Sending..."}
          {message.status === "failed" && " • Failed"}
        </p>
      </div>
      {message.sender === "seller" && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className="text-xs">You</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
);

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
