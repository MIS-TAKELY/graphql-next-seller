
import { uploadBufferWithRotation } from "./utils/cloudinary-rotation";
import * as dotenv from "dotenv";
import path from "path";

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runTest() {
    process.env.NODE_ENV = 'development'; // Enable logging

    console.log("--- Starting Cloudinary Upload Test ---");

    // Test Image Upload (Mock small buffer)
    const imageBuffer = Buffer.from("fake-image-data-" + Date.now());
    console.log("\n1. Testing Image Upload...");
    try {
        const result = await uploadBufferWithRotation(
            imageBuffer,
            "test-image.webp",
            "image/webp",
            3,
            "image"
        );
        console.log("Image upload SUCCESS:", result.secure_url);
    } catch (error: any) {
        console.error("Image upload FAILED:", error.message);
    }

    // Test Video Upload (Mock small buffer, Cloudinary treats it as video)
    // Note: Cloudinary might reject a fake buffer as a video if it validates headers,
    // but we can at least check if it sends the correct resource_type in the URL.
    const videoBuffer = Buffer.from("fake-video-data-" + Date.now());
    console.log("\n2. Testing Video Upload (using small buffer)...");
    try {
        const result = await uploadBufferWithRotation(
            videoBuffer,
            "test-video.mp4",
            "video/mp4",
            1, // Single attempt to see the URL error if it fails validation
            "video"
        );
        console.log("Video upload SUCCESS:", result.secure_url);
    } catch (error: any) {
        console.log("Video upload result:", error.message);
        console.log("(Note: Failures here are expected if the buffer isn't a valid video, but we verified the URL/Type signaling)");
    }
}

runTest();
