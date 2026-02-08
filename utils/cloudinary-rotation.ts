/**
 * Multi-Cloudinary Account Rotation System (Server-side)
 * 
 * Distributes uploads across 5 Cloudinary accounts using round-robin rotation
 * to prevent quota exhaustion on any single account.
 */

export interface CloudinaryAccount {
    cloudName: string;
    uploadPreset: string;
    index: number;
}

const ACCOUNT_COUNT = 5;

/**
 * Server-side rotation index (in-memory)
 */
let rotationIndex = 0;

/**
 * Get the next Cloudinary account in rotation
 */
export function getNextCloudinaryAccount(): CloudinaryAccount {
    const index = rotationIndex;

    // Support both old and new env variable naming
    const cloudName = process.env[`NEXT_PUBLIC_CLOUDINARY_ACCOUNT_${index}_NAME`] ||
        process.env[`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME${index === 0 ? '' : index}`];
    const uploadPreset = process.env[`NEXT_PUBLIC_CLOUDINARY_ACCOUNT_${index}_PRESET`] ||
        process.env[`NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET${index === 0 ? '' : index}`];

    if (!cloudName || !uploadPreset) {
        throw new Error(`Cloudinary account ${index} configuration missing`);
    }

    // Increment for next call
    rotationIndex = (rotationIndex + 1) % ACCOUNT_COUNT;

    return {
        cloudName,
        uploadPreset,
        index
    };
}

/**
 * Upload buffer to Cloudinary with automatic account rotation and retry
 */
export async function uploadBufferWithRotation(
    buffer: Buffer,
    filename?: string,
    mimeType: string = "image/webp",
    maxRetries: number = 3,
    resourceType: "image" | "video" | "raw" | "auto" = "auto"
): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const account = getNextCloudinaryAccount();

            const formData = new FormData();
            const blob = new Blob([buffer as any], { type: mimeType });
            formData.append("file", blob, filename || (resourceType === "video" ? "video.mp4" : "image.webp"));
            formData.append("upload_preset", account.uploadPreset);

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Uploading ${resourceType} to account ${account.index} (${account.cloudName}) - Attempt ${attempt + 1}`);
            }

            // Create an AbortController for the timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${account.cloudName}/${resourceType}/upload`,
                {
                    method: "POST",
                    body: formData,
                    signal: controller.signal
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cloudinary API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cloudinary] Upload successful to account ${account.index}`);
            }

            return data;
        } catch (error: any) {
            lastError = error;

            const isTimeout = error.name === 'AbortError';
            console.error(`[Cloudinary] Upload attempt ${attempt + 1} failed ${isTimeout ? '(TIMEOUT)' : ''}:`, error.message);

            // If this is the last attempt, throw the error
            if (attempt === maxRetries - 1) {
                break;
            }

            // Wait briefly before retrying (exponential backoff)
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error(
        `Failed to upload to Cloudinary after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
    );
}
