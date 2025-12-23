import { LocalMessage } from "@/hooks/chat/useChat";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { MediaGrid } from "./MediaGrid";
import { MediaViewer } from "./MediaViewer";

interface MessageBubbleProps {
  message: LocalMessage;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const time = message.timestamp
    ? format(new Date(message.timestamp), "HH:mm")
    : "";

  const attachments = message.attachments || [];

  const handleMediaClick = (index: number) => {
    setViewerIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-card border rounded-tl-sm"
        )}
      >
        {/* Media Grid */}
        <MediaGrid
          attachments={attachments}
          onMediaClick={handleMediaClick}
        />

        {/* Text */}
        {message.text && (
          <p className={cn("whitespace-pre-wrap leading-relaxed break-words", attachments.length > 0 && "mt-2")}>
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
            <CheckCheck
              className={cn(
                "w-3 h-3",
                message.status === "sending" ? "opacity-50" : "opacity-100"
              )}
            />
          )}
        </div>
      </div>

      {/* Lightbox */}
      <MediaViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        initialIndex={viewerIndex}
        attachments={attachments}
      />
    </div>
  );
}