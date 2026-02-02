import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // OpenRouter Free tier is extremely limited (as low as 55 tokens). 
    // We truncate to 120 characters to remain under this limit while capturing the product name.
    const truncatedText = text.slice(0, 120);

    const response = await openai.embeddings.create({
      model: "openai/text-embedding-3-large",
      input: truncatedText,
      dimensions: 3072,
    });

    if (!response || !response.data || !Array.isArray(response.data) || response.data.length === 0) {
      if ((response as any).error?.code === 402 || (response as any).error?.message?.includes("tokens limit exceeded")) {
        throw new Error(`OpenRouter Free Limit: ${(response as any).error.message}. Please add a few dollars of credit to your OpenRouter account to remove this limit.`);
      }
      console.error("❌ Unexpected response structure:", JSON.stringify(response, null, 2));
      throw new Error("Invalid response structure from embeddings API");
    }

    return response.data[0].embedding;
  } catch (error: any) {
    if (error.message?.includes("tokens limit exceeded")) {
      console.error("❌ Token limit exceeded even with truncation. The product title is too long for the free tier.");
    }
    console.error("❌ Error generating embedding:", error.message || error);
    throw error;
  }
}
