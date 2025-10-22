// lib/uploadFilesToStorage.ts

import { uploadToCloudinary } from "./uploadToCloudinary";

export async function uploadFilesToStorage(files: File[]) {
  return Promise.all(
    files.map(async (file) => {
      // Only image/video are supported by your current schema
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

      if (!isVideo && !isImage) {
        throw new Error("Unsupported file type. Only images and videos are allowed.");
      }

      const res = await uploadToCloudinary(file, resourceType as "image" | "video");
      return {
        url: res.url,
        type: (isVideo ? "VIDEO" : "IMAGE") as "VIDEO" | "IMAGE",
      };
    })
  );
}