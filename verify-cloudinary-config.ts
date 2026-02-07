
import { getNextCloudinaryAccount } from "./utils/cloudinary-rotation";
import * as dotenv from "dotenv";
import path from "path";

// Load .env explicitly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function verifyConfig() {
    console.log("Starting Cloudinary Config Verification...");

    const accounts = [];
    try {
        for (let i = 0; i < 5; i++) {
            const account = getNextCloudinaryAccount();
            accounts.push(account);
            console.log(`Account ${i}:`, account);
        }

        console.log("\nSuccess! All 5 accounts retrieved successfully.");

        // Final check on rotation
        const nextAccount = getNextCloudinaryAccount();
        console.log("\nRotation check (should be index 0):", nextAccount.index === 0 ? "PASSED" : "FAILED");

    } catch (error:any) {
        console.error("\nVerification FAILED:", error.message);
        process.exit(1);
    }
}

verifyConfig();
