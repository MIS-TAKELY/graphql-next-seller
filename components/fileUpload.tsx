"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { File, Upload, Video, X } from "lucide-react";
import type React from "react";
import { useCallback, useState } from "react";

type FileWithPreview = {
  file?: File;
  preview: string;
  type: "image" | "video" | "other";
};

interface FileUploadProps {
  value: FileWithPreview[];
  onChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  className?: string;
  allowVideo?: boolean;
  disabled?: boolean;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 10,
  className,
  allowVideo = false,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || disabled) return;

      const newFiles: FileWithPreview[] = [];
      const remainingSlots = maxFiles - value.length;

      Array.from(files)
        .slice(0, remainingSlots)
        .forEach((file) => {
          if (
            file.type.startsWith("image/") ||
            (allowVideo && file.type.startsWith("video/"))
          ) {
            const fileWithPreview: FileWithPreview = {
              file,
              preview: URL.createObjectURL(file),
              type: file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                ? "video"
                : "other",
            };
            newFiles.push(fileWithPreview);
          }
        });

      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
      }
    },
    [value, onChange, maxFiles, allowVideo, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(value[index].preview);
  };

  const acceptTypes = allowVideo ? "image/*,video/*" : "image/*";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
          (value.length >= maxFiles || disabled) &&
            "opacity-50 pointer-events-none"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.multiple = true;
              input.accept = acceptTypes;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                processFiles(target.files);
              };
              input.click();
            }}
            disabled={value.length >= maxFiles || disabled}
          >
            Choose Files
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            {allowVideo ? "Images and videos" : "Images only"} up to 10MB each.{" "}
            {value.length}/{maxFiles} uploaded.
          </p>
        </div>
      </Card>

      {/* File Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((item, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {item.type === "image" ? (
                  <img
                    src={item.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : item.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video className="w-full h-full object-cover">
                      <source src={item.preview} />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <File className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-2">
                      Unsupported file
                    </span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Main
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
