// components/product/steps/MediaStep.tsx
"use client";

import { FileUpload, FileWithPreview } from "@/components/fileUpload";
import { FormField } from "@/components/form-field";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Errors, FormData, Media } from "@/types/pages/product";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { Video, Plus } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";

interface MediaStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

interface IPreviewMediaInterface {
  url: string;
  previewType: "image" | "video"; // Renamed and typed for FileUpload
  isLocal: boolean;
  pending: boolean;
}

export const MediaStep = React.memo(
  ({ formData, errors, updateFormData }: MediaStepProps) => {
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [currentMediaSection, setCurrentMediaSection] = useState<"productMedia" | "promotionalMedia">("productMedia");

    const validateVideoUrl = (url: string) => {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com)\/.+$/;
      const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com)\/(p|reels|reel)\/.+$/;

      return youtubeRegex.test(url) || tiktokRegex.test(url) || instagramRegex.test(url);
    };

    const handleAddVideoLink = () => {
      if (!videoUrl.trim()) {
        toast.error("Please enter a video URL");
        return;
      }

      if (!validateVideoUrl(videoUrl)) {
        toast.error("Invalid video URL. Supported: YouTube, TikTok, Instagram (Posts/Reels)");
        return;
      }

      const mediaRole = currentMediaSection === "productMedia" ? "PRIMARY" : "PROMOTIONAL";

      const newVideoMedia: Media = {
        url: videoUrl.trim(),
        mediaType: mediaRole as any,
        fileType: "VIDEO" as any,
        sortOrder: formData[currentMediaSection].length,
      };

      updateFormData(currentMediaSection, (prev: any[]) => [...prev, newVideoMedia]);
      setVideoUrl("");
      setIsVideoDialogOpen(false);
      toast.success("Video link added successfully");
    };
    const handleMediaUpload = useCallback(
      async (
        files: FileWithPreview[],
        mediaSection: "productMedia" | "promotionalMedia" // Renamed param for clarity
      ) => {
        if (files.length === 0) return;

        const mediaRole =
          mediaSection === "productMedia" ? "PRIMARY" : "PROMOTIONAL";

        // Add local preview immediately
        const pendingMedia: IPreviewMediaInterface[] = files.map((f) => ({
          url: f.preview,
          previewType: f.type.startsWith("image/") ? "image" : "video",
          isLocal: true,
          pending: true,
        }));

        updateFormData(mediaSection, (prev: any[]) => [
          ...prev,
          ...pendingMedia,
        ]);

        try {
          const uploadPromises = files.map(async (fileWithPreview) => {
            if (!fileWithPreview.file) return null;

            const resourceType = fileWithPreview.file.type.startsWith("video/")
              ? "video"
              : "image";

            try {
              const result = await uploadToCloudinary(
                fileWithPreview.file,
                resourceType === "image" ? "product" : "auto"
              );

              const fileType =
                result.resourceType.toUpperCase() === "IMAGE" ? "IMAGE" : "VIDEO";

              return {
                url: result.url,
                mediaType: mediaRole,
                publicId: result.publicId,
                altText: result.altText || "",
                fileType,
              } as Media;
            } catch (err) {
              console.error(`Failed to upload ${fileWithPreview.file.name}:`, err);
              toast.error(`Failed to upload ${fileWithPreview.file.name}`);
              return null;
            }
          });

          const uploadedResults = await Promise.all(uploadPromises);
          const uploaded = uploadedResults.filter(
            (m): m is Media => m !== null
          );

          // Replace pending media with uploaded ones
          updateFormData(mediaSection, (prev: any[]) => [
            ...prev.filter((m) => !m.pending),
            ...uploaded,
          ]);
        } catch (err) {
          console.error("Upload process failed:", err);
          toast.error("An error occurred during upload");
          // Remove pending if upload failed
          updateFormData(
            mediaSection,
            (prev: any[]) => prev.filter((m) => !m.pending)
          );
        }
      },
      [formData, updateFormData]
    );

    const handleRemoveMedia = useCallback(
      (index: number, mediaSection: "productMedia" | "promotionalMedia") => {
        const updated = [...formData[mediaSection]];
        const [removed] = updated.splice(index, 1);
        updateFormData(mediaSection, updated);

        if (removed?.isLocal && removed.url) {
          URL.revokeObjectURL(removed.url);
        }
      },
      [formData, updateFormData]
    );

    const handleReorder = useCallback(
      (
        activeIndex: number,
        overIndex: number,
        mediaSection: "productMedia" | "promotionalMedia"
      ) => {
        const items = [...formData[mediaSection]];
        const [movedItem] = items.splice(activeIndex, 1);
        items.splice(overIndex, 0, movedItem);

        // Update sortOrder for all items
        const reordered = items.map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

        updateFormData(mediaSection, reordered);
      },
      [formData, updateFormData]
    );


    const getPreviewType = (media: any): "image" | "video" => {
      // Helper to map for FileUpload
      if ("previewType" in media) return media.previewType;
      if ("fileType" in media)
        return media.fileType === "IMAGE" ? "image" : "video";
      return "image"; // Default
    };

    return (
      <div className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Product Media</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                setCurrentMediaSection("productMedia");
                setIsVideoDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Video Link
            </Button>
          </div>
          <FormField
            label="Product Media (Minimum 1 Primary Image required)"
            error={errors.productMedia}
            required
          >
            <FileUpload
              value={formData.productMedia.map((m) => ({
                preview: m.url,
                type: getPreviewType(m),
              }))}
              onChange={(files) =>
                handleMediaUpload(
                  files.filter((f) => f.file),
                  "productMedia"
                )
              }
              onRemove={(i) => handleRemoveMedia(i, "productMedia")}
              onReorder={(activeIndex, overIndex) =>
                handleReorder(activeIndex, overIndex, "productMedia")
              }
              maxFiles={20}
              allowVideo
              maxFilesSize={25 * 1024 * 1024}
            />
          </FormField>
        </Card>

        <Separator />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Promotional Media</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                setCurrentMediaSection("promotionalMedia");
                setIsVideoDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Video Link
            </Button>
          </div>
          <FormField label="Promotional Media (Optional)">
            <FileUpload
              value={formData.promotionalMedia.map((m) => ({
                preview: m.url,
                type: getPreviewType(m),
              }))}
              onChange={(files) =>
                handleMediaUpload(
                  files.filter((f) => f.file),
                  "promotionalMedia"
                )
              }
              onRemove={(i) => handleRemoveMedia(i, "promotionalMedia")}
              onReorder={(activeIndex, overIndex) =>
                handleReorder(activeIndex, overIndex, "promotionalMedia")
              }
              maxFiles={20}
              allowVideo
              maxFilesSize={25 * 1024 * 1024}
            />
          </FormField>
        </Card>

        {/* Video Link Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video Link</DialogTitle>
              <DialogDescription>
                Paste a link from YouTube, TikTok, or Instagram (Posts/Reels).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Video URL</label>
                <div className="relative">
                  <Video className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-9"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVideoDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddVideoLink}>Add Video</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

MediaStep.displayName = "MediaStep";
