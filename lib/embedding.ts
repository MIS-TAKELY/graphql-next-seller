import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // OpenRouter/Free tier limits can be extremely tight (e.g., 74 tokens).
    // We truncate to ~250 characters to stay within these limits while keeping the most relevant info (Product Name).
    const truncatedText = text.slice(0, 250);

    const response = await openai.embeddings.create({
      model: "openai/text-embedding-3-large",
      input: truncatedText,
      dimensions: 3072, // Keep 3072 for DB compatibility
    });

    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      if ((response as any).error?.code === 402) {
        throw new Error(`Credits/Limit exceeded: ${(response as any).error.message}`);
      }
      console.error("❌ Unexpected response structure:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response structure from embeddings API");
    }

    return response.data[0].embedding;
  } catch (error: any) {
    if (error.message?.includes("tokens limit exceeded")) {
      console.error("❌ Token limit exceeded (very tight limit). Truncating further might be needed.");
    }
    console.error("❌ Error generating embedding:", error.message || error);
    throw error;
  }
}
