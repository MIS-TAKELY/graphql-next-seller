// components/ImageUpload.tsx
import Image from "next/image";
import { useEffect, useState } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  onChange: (url: string) => void;
  value?: string;
  recommended?: string;
}

export default function ImageUpload({
  label,
  onChange,
  value,
  recommended,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const res = await uploadToCloudinary(file, "product");
      setPreview(res.url);
      onChange(res.url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
        {recommended && (
          <p className="text-xs text-muted-foreground">{recommended}</p>
        )}
      </div>

      <div className="flex items-start gap-8">
        {/* Preview */}
        <div className="shrink-0">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-input">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-input rounded-lg bg-muted flex items-center justify-center">
              <span className="text-4xl text-muted-foreground font-light">+</span>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="flex-1 space-y-3">
          <div>
            <label className="block">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                disabled={isUploading}
                className="block w-full text-sm text-foreground
                  file:mr-4 file:py-2.5 file:px-5 
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900/30 dark:file:text-blue-400
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer"
              />
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP up to 5MB. Recommended: Square (1080x1080px).
            </p>
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}