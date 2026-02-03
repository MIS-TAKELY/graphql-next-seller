import { OpenAI } from "openai";

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(process.env.EMBEDDING_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        texts: [text],
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embeddings[0];
  } catch (error: any) {
    console.error("❌ Error generating embedding:", error.message || error);
    throw error;
  }
}
