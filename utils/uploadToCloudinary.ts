export const uploadToCloudinary = async (file: File, type: "product" | "banner" | "category" | "auto" = "auto") => {
  // 1. File Size Check (50MB) - Prevent upload if too large
  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 50MB limit.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  console.log(`[Upload] Starting upload: name=${file.name}, type=${file.type}, size=${file.size}`);

  // 2. Timeout (5 minutes) - Prevent infinite hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    // Use local API for server-side processing (sharp)
    const response = await fetch(`/api/upload`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed:", response.status, errorText);
      throw new Error(`Failed to upload: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    return {
      url: data.url,
      publicId: data.publicId,
      resourceType: data.resourceType,
      size: data.size,
      altText: data.altText
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error("[Upload] Request timed out after 5 minutes");
      throw new Error("Upload timed out. Please check your internet connection.");
    }
    throw error;
  }
};
