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
      const res = await uploadToCloudinary(file, "image");
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {recommended && (
          <p className="text-xs text-gray-500">{recommended}</p>
        )}
      </div>

      <div className="flex items-start gap-8">
        {/* Preview */}
        <div className="shrink-0">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <span className="text-4xl text-gray-400 font-light">+</span>
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
                className="block w-full text-sm text-gray-600
                  file:mr-4 file:py-2.5 file:px-5 
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed
                  cursor-pointer"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WebP up to 5MB
            </p>
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Uploading image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}