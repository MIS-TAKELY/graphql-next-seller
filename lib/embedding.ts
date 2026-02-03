import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  console.error("Error: HF_TOKEN is not set in .env file");
}

const client = new InferenceClient(HF_TOKEN);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log("Generating embedding for:", text);

    const output = await client.featureExtraction({
      model: "Qwen/Qwen3-Embedding-8B",
      inputs: text,
    });

    console.log("Embedding generated successfully");

    // Flatten to ensure it's a 1D array of numbers.
    const flatEmbedding = Array.isArray(output[0])
      ? (output[0] as number[])
      : (output as number[]);

    console.log("Output length:", flatEmbedding.length);

    return flatEmbedding;
  } catch (err) {
    console.error("Embedding error:");
    console.error(err);
    throw err;
  }
}
