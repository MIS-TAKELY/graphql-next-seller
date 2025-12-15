// import { LocalMessage } from "@/hooks/chat/useSellerChat"; // Ensure this matches your hook filename
import { LocalMessage } from "@/hooks/chat/useChat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCheck, FileIcon, FileText } from "lucide-react";

interface MessageBubbleProps {
  message: LocalMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // Fix 1: Use 'timestamp' instead of 'createdAt'
  const time = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm")
    : "";

  const attachments = message.attachments || [];

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[80%] sm:max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border rounded-tl-sm"
        )}
      >
        {/* Fix 2: Map through 'attachments' array instead of using single 'fileUrl' */}
        {attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {attachments.map((attachment, index) => (
              <div key={attachment.id || index}>
                {attachment.type === "IMAGE" ||
                (attachment.type === "VIDEO" && !attachment.url.endsWith(".pdf")) || // Fallback check
                attachment.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={attachment.url}
                    alt="attachment"
                    className="rounded-lg max-h-60 w-full object-cover border bg-black/5"
                  />
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg transition-colors overflow-hidden",
                      isOwn
                        ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    <div className="shrink-0 bg-background/20 p-1 rounded">
                       <FileText className="h-5 w-5" />
                    </div>
                    <span className="underline truncate text-xs sm:text-sm">
                      {attachment.url.split("/").pop() || "Download File"}
                    </span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="whitespace-pre-wrap leading-relaxed break-words">
            {message.text}
          </p>
        )}

        {/* Meta (Time & Status) */}
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1 select-none opacity-80",
            isOwn ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          <span className="text-[10px]">{time}</span>
          {isOwn && (
            // Status logic: sending -> clock?, sent -> check, read -> check-check
            <CheckCheck
              className={cn(
                "w-3 h-3",
                message.status === "sending" ? "opacity-50" : "opacity-100"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}