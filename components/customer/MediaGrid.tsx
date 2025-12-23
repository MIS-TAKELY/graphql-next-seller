import { cn } from "@/lib/utils";
import { FileIcon, Play } from "lucide-react";

interface MediaGridProps {
    attachments: any[]; // Using any[] to match seller's LocalMessage.attachments type
    onMediaClick: (index: number) => void;
}

export function MediaGrid({ attachments, onMediaClick }: MediaGridProps) {
    if (!attachments || attachments.length === 0) return null;

    // Filter for only visual media
    const visualAttachments = attachments.filter(
        (a) =>
            a.type === "IMAGE" ||
            a.type === "VIDEO" ||
            a.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i)
    );

    const nonVisualAttachments = attachments.filter(
        (a) => !visualAttachments.includes(a)
    );

    const count = visualAttachments.length;

    const renderMediaItem = (item: any, index: number, isOverlay = false, overlayCount = 0) => {
        const isVideo = item.type === "VIDEO" || item.url.match(/\.(mp4|webm|mov)$/i);

        return (
            <div
                key={item.id || index}
                className="relative w-full h-full cursor-pointer group overflow-hidden bg-black/5"
                onClick={() => onMediaClick(index)}
            >
                {item.type === "IMAGE" || item.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                        src={item.url}
                        alt="attachment"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="relative w-full h-full">
                            <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <Play className="w-10 h-10 text-white fill-white opacity-80" />
                            </div>
                        </div>
                    </div>
                )}

                {isOverlay && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">+{overlayCount}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Visual Grid */}
            {count > 0 && (
                <div className={cn(
                    "grid gap-[2px] rounded-2xl overflow-hidden",
                    count === 1 ? "grid-cols-1 h-64 sm:h-80" :
                        count === 2 ? "grid-cols-2 h-40 sm:h-48" :
                            count === 3 ? "grid-cols-2 h-40 sm:h-60" :
                                "grid-cols-2 h-40 sm:h-60" // 4+
                )}>
                    {count === 1 && renderMediaItem(visualAttachments[0], 0)}

                    {count === 2 && (
                        <>
                            {renderMediaItem(visualAttachments[0], 0)}
                            {renderMediaItem(visualAttachments[1], 1)}
                        </>
                    )}

                    {count === 3 && (
                        <>
                            <div className="col-span-2 row-span-2 h-full">
                                {renderMediaItem(visualAttachments[0], 0)}
                            </div>
                            {renderMediaItem(visualAttachments[1], 1)}
                            {renderMediaItem(visualAttachments[2], 2)}
                        </>
                    )}

                    {count >= 4 && (
                        <>
                            {renderMediaItem(visualAttachments[0], 0)}
                            {renderMediaItem(visualAttachments[1], 1)}
                            {renderMediaItem(visualAttachments[2], 2)}
                            {renderMediaItem(visualAttachments[3], 3, count > 4, count - 3)}
                        </>
                    )}
                </div>
            )}

            {/* Non-visual files list (Docs, PDFs, etc) */}
            {nonVisualAttachments.length > 0 && (
                <div className="flex flex-col gap-1">
                    {nonVisualAttachments.map((file, i) => (
                        <a
                            key={i}
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors border"
                        >
                            <div className="p-2 bg-background rounded-md border shadow-sm">
                                <FileIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {file.url.split('/').pop()}
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    {(file.url.split('.').pop() || 'FILE')}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
