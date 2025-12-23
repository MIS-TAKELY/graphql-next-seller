import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    initialIndex: number;
    attachments: any[]; // Using any[] to match seller's LocalMessage.attachments type
}

export function MediaViewer({ isOpen, onClose, initialIndex, attachments }: MediaViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Filter only visual items for the viewer navigation
    const visualAttachments = attachments?.filter(
        (a) =>
            a.type === "IMAGE" ||
            a.type === "VIDEO" ||
            a.url.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)$/i)
    ) || [];

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!isOpen || visualAttachments.length === 0) return null;

    const currentMedia = visualAttachments[currentIndex];
    const isVideo = currentMedia.type === "VIDEO" || currentMedia.url.match(/\.(mp4|webm|mov)$/i);
    const total = visualAttachments.length;

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % total);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + total) % total);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-screen-xl w-full h-[95vh] p-0 bg-transparent border-none shadow-none flex flex-col justify-center items-center gap-0 overflow-hidden outline-none">

                {/* Accessible Title/Desc for Screen Readers */}
                <DialogTitle className="sr-only">Media Viewer</DialogTitle>
                <DialogDescription className="sr-only">Viewing media attachment {currentIndex + 1} of {total}</DialogDescription>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Navigation Arrows */}
                {total > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                )}

                {/* Content */}
                <div className="relative w-full h-full flex items-center justify-center p-4">
                    {isVideo ? (
                        <video
                            src={currentMedia.url}
                            className="max-w-full max-h-full rounded-md shadow-2xl"
                            controls
                            autoPlay
                        />
                    ) : (
                        <img
                            src={currentMedia.url}
                            alt={`Attachment ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                        />
                    )}
                </div>

                {/* Counter */}
                {total > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                        {currentIndex + 1} / {total}
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
