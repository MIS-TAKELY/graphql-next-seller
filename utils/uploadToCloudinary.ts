export const uploadToCloudinary = async (file: File, resourceType: "image" | "video" | "raw" | "auto" = "auto") => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env variables are not set");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  console.log("cloudineray formdata-->",formData)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload to Cloudinary");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    size: data.bytes,
  };
};
