import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "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",
  baseURL: "https://openrouter.ai/api/v1",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "openai/text-embedding-3-large",
    input: text,
    dimensions: 3072,
  });
  return response.data[0].embedding;
}
 