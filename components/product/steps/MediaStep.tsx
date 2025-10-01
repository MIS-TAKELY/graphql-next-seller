"use client";

import { FileUpload } from "@/components/fileUpload";
import { FormField } from "@/components/form-field";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Errors, FormData, Media } from "@/types/pages/product";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useCallback, useState } from "react";

interface MediaStepProps {
  formData: FormData;
  errors: Errors;
  updateFormData: (field: keyof FormData, value: any) => void;
}

type FileWithPreview = {
  file?: File;
  preview: string;
  type: "image" | "video" | "other";
};

export const MediaStep = ({
  formData,
  errors,
  updateFormData,
}: MediaStepProps) => {
  const [productPreviews, setProductPreviews] = useState<FileWithPreview[]>([]);
  const [promotionalPreviews, setPromotionalPreviews] = useState<
    FileWithPreview[]
  >([]);

  const handleMediaUpload = useCallback(
    async (
      files: FileWithPreview[],
      mediaType: "productMedia" | "promotionalMedia"
    ) => {
      if (files.length === 0) return;

      // Update previews immediately
      const setPreviews =
        mediaType === "productMedia"
          ? setProductPreviews
          : setPromotionalPreviews;
      setPreviews((prev) => [...prev, ...files]);

      try {
        const uploadPromises = files.map(async (fileWithPreview) => {
          if (!fileWithPreview.file) return null;

          const resourceType = fileWithPreview.file.type.startsWith("video/")
            ? "video"
            : "image";

          const result = await uploadToCloudinary(
            fileWithPreview.file,
            resourceType
          );

          // Revoke the local preview URL as we now have the Cloudinary URL
          URL.revokeObjectURL(fileWithPreview.preview);

          return {
            url: result.url,
            mediaType: result.resourceType,
            publicId: result.publicId,
            altText: "",
            caption: "",
          } as Media;
        });

        const newMedia = (await Promise.all(uploadPromises)).filter(
          (media): media is Media => media !== null
        );

        updateFormData(mediaType, [...formData[mediaType], ...newMedia]);

        // Remove previews after successful upload
        setPreviews((prev) => prev.filter((file) => !files.includes(file)));
      } catch (error) {
        console.error("Upload failed:", error);
        // Remove failed uploads from previews
        setPreviews((prev) => prev.filter((file) => !files.includes(file)));
      }
    },
    [updateFormData]
  );

  const handleRemoveMedia = useCallback(
    (index: number, mediaType: "productMedia" | "promotionalMedia") => {
      const newMedia = [...formData[mediaType]];
      const [removedMedia] = newMedia.splice(index, 1);
      updateFormData(mediaType, newMedia);

      if (removedMedia.url) {
        URL.revokeObjectURL(removedMedia.url);
      }
    },
    [formData, updateFormData]
  );

  const handleRemovePreview = useCallback(
    (index: number, mediaType: "productMedia" | "promotionalMedia") => {
      const setPreviews =
        mediaType === "productMedia"
          ? setProductPreviews
          : setPromotionalPreviews;
      setPreviews((prev) => {
        const newPreviews = [...prev];
        const [removed] = newPreviews.splice(index, 1);
        if (removed.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        return newPreviews;
      });
    },
    []
  );

  // Combine uploaded media and local previews
  const productMediaPreviews = [
    ...formData.productMedia.map((media) => ({
      preview: media.url,
      type: media.mediaType as "image" | "video",
      file: undefined,
    })),
    ...productPreviews,
  ].slice(0, 10); // Respect maxFiles limit

  const promotionalMediaPreviews = [
    ...formData.promotionalMedia.map((media) => ({
      preview: media.url,
      type: media.mediaType as "image" | "video",
      file: undefined,
    })),
    ...promotionalPreviews,
  ].slice(0, 5); // Respect maxFiles limit

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
            value={productMediaPreviews}
            onChange={(files) =>
              handleMediaUpload(
                files.filter((f) => f.file),
                "productMedia"
              )
            }
            maxFiles={10}
            allowVideo={true}
          />
        </FormField>
      </Card>

      <Separator />

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Promotional Media</h3>
        <FormField label="Promotional Media (Optional)">
          <FileUpload
            value={promotionalMediaPreviews}
            onChange={(files) =>
              handleMediaUpload(
                files.filter((f) => f.file),
                "promotionalMedia"
              )
            }
            maxFiles={5}
            allowVideo={true}
          />
        </FormField>
      </Card>
    </div>
  );
};
