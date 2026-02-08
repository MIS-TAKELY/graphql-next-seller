// components/product/steps/MediaStep.tsx
"use client";

import { FileUpload, FileWithPreview } from "@/components/fileUpload";
import { FormField } from "@/components/form-field";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData, Media } from "@/types/pages/product";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import React, { useCallback } from "react";
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
          <h3 className="text-lg font-medium mb-4">Product Media</h3>
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
              maxFiles={10}
              allowVideo
              maxFilesSize={25 * 1024 * 1024}
            />
          </FormField>
        </Card>

        <Separator />

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Promotional Media</h3>
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
              maxFiles={5}
              allowVideo
              maxFilesSize={25 * 1024 * 1024}
            />
          </FormField>
        </Card>
      </div>
    );
  }
);

MediaStep.displayName = "MediaStep";
