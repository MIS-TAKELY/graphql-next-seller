// components/customers/MessageBubble.tsx
import { LocalMessage } from "@/hooks/chat/useChat";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

interface MessageBubbleProps {
  message: LocalMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isSeller = message.sender === "seller";

  return (
    <div className={cn("flex", isSeller ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2",
          isSeller ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {message.text && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.id}>
                {attachment.type === "IMAGE" ? (
                  <img
                    src={attachment.url}
                    alt="Attachment"
                    className="rounded-md max-w-full h-auto"
                    loading="lazy"
                  />
                ) : attachment.type === "VIDEO" ? (
                  <video
                    src={attachment.url}
                    controls
                    className="rounded-md max-w-full h-auto"
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                  >
                    <FileText className="w-5 h-5" />
                    {attachment.url.split("/").pop() || "Document"}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.status === "sending" && (
            <span className="text-xs opacity-70">Sending...</span>
          )}
          {message.status === "failed" && (
            <span className="text-xs text-destructive">Failed</span>
          )}
        </div>
      </div>
    </div>
  );
};