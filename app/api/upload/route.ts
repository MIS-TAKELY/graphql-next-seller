
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Configure route to accept larger files (10MB)
export const runtime = 'nodejs';
export const maxDuration = 300; // 300 seconds (5 mins) timeout for large file processing

// Allowed image MIME types (secure formats)
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif'
];

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime'
];

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

// Helper to upload buffer to Cloudinary with rotation
import { uploadBufferWithRotation } from "@/utils/cloudinary-rotation";

async function uploadBufferToCloudinary(
    buffer: Buffer,
    folder: string = "seller",
    filename?: string,
    mimeType: string = "image/webp",
    resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<any> {
    // Note: folder parameter is ignored as Cloudinary unsigned presets
    // have predefined folder configurations
    console.log(`[API Upload] Starting Cloudinary upload for ${filename} (Type: ${resourceType}, Size: ${buffer.length} bytes)`);
    return uploadBufferWithRotation(buffer, filename, mimeType, 3, resourceType);
}

export async function POST(req: NextRequest) {
    console.log(`[API Upload] Request received: ${req.method} ${req.url}`);
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

        console.log(`[API Upload] Received file: ${file.name}, Type: ${file.type}, Size: ${file.size}`);

        // Validate file type
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            console.warn(`[API Upload] Unsupported file type: ${file.type}`);
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}` },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Validate file size (50MB max)
        if (buffer.length > MAX_FILE_SIZE) {
            console.error(`[API Upload] File too large: ${buffer.length} bytes`);
            return NextResponse.json(
                { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
                { status: 413 }
            );
        }
        let processedBuffer: Buffer;
        let contentType: string;

        const isSmallFile = buffer.length <= 300 * 1024;

        if (isVideo || isSmallFile) {
            // Skip compression for small files and videos
            console.log(`[API Upload] Skipping compression for ${isVideo ? 'video' : 'small image'}`);
            processedBuffer = buffer;
            contentType = file.type || (isVideo ? "video/mp4" : "image/webp");
        } else {
            // Sharp Optimization Logic for files > 200KB
            console.log(`[API Upload] Optimizing image with Sharp`);
            const image = sharp(buffer);
            // const metadata = await image.metadata(); // Metadata unused

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

            processedBuffer = await sharpInstance.toBuffer();
            contentType = "image/webp";
            console.log(`[API Upload] Optimization complete. Initial: ${buffer.length}, Final: ${processedBuffer.length}`);
        }

        // Upload to Cloudinary
        const resourceType = isVideo ? "video" : "image";
        const result = await uploadBufferToCloudinary(
            processedBuffer,
            "seller", // or dynamic folder based on type
            file.name,
            contentType,
            resourceType
        );

        console.log(`[API Upload] Cloudinary upload successful: ${result.secure_url}`);

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
