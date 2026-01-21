
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Helper to upload buffer to Cloudinary
async function uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string = "seller",
    filename?: string
): Promise<any> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Missing Cloudinary configuration");
    }

    const formData = new FormData();
    // Blob from buffer
    const blob = new Blob([buffer as any], { type: "image/webp" });
    formData.append("file", blob, filename || "image.webp");
    formData.append("upload_preset", uploadPreset);
    if (folder) formData.append("folder", folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary error:", errorText);
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    return response.json();
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const type = formData.get("type") as string | null; // 'product', 'banner', 'category', etc.

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let processedBuffer: any = buffer;

        // Sharp Optimization Logic
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Default to converting to WebP for optimization
        let sharpInstance = image.webp({ quality: 80 });

        if (type === "product") {
            // Products: 1080x1080 Square
            sharpInstance = sharpInstance.resize(1080, 1080, {
                fit: "cover",
                position: "center",
            });
        } else if (type === "banner") {
            // This is seller app, but just in case we reuse logic or seller adds banners later
            sharpInstance = sharpInstance.resize(1920, 600, {
                fit: "cover",
                position: "center",
            })
        }
        // Add more types as needed

        processedBuffer = await sharpInstance.toBuffer() as unknown as Buffer;

        // Upload to Cloudinary
        const result = await uploadBufferToCloudinary(
            processedBuffer as any,
            "seller", // or dynamic folder based on type
            file.name
        );

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            size: result.bytes,
            altText: result.display_name
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
