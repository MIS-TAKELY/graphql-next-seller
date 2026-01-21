export const uploadToCloudinary = async (file: File, type: "product" | "banner" | "category" | "auto" = "auto") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  // Use local API for server-side processing (sharp)
  const response = await fetch(`/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload failed:", response.status, errorText);
    throw new Error(`Failed to upload: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    url: data.url,
    publicId: data.publicId,
    resourceType: data.resourceType,
    size: data.size,
    altText: data.altText
  };
};
