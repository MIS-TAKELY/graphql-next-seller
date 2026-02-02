import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "openai/text-embedding-3-large",
      input: text,
      dimensions: 3072,
    });

    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.error("❌ Unexpected response from OpenRouter embeddings API:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response structure from embeddings API");
    }

    return response.data[0].embedding;
  } catch (error: any) {
    console.error("❌ Error generating embedding:", error.message || error);
    // Log the full error if it's from OpenAI/OpenRouter client
    if (error.response) {
      console.error("Provider Response Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error; // Re-throw to be caught by the resolver's try-catch
  }
}
