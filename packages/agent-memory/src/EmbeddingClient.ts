/**
 * EmbeddingClient — generates vector embeddings using Gemini text-embedding-004 API.
 *
 * Falls back gracefully (returns null) when no API key is available,
 * allowing the rest of the search pipeline to continue with TF-IDF only.
 */

const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_DIMENSIONS = 768;
const EMBEDDING_BATCH_SIZE = 10;

export interface EmbeddingVector {
  values: number[];
}

export class EmbeddingClient {
  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate a single embedding vector for a text string.
   * Returns null if API key is missing or the request fails.
   */
  async embed(text: string): Promise<EmbeddingVector | null> {
    if (!this.apiKey) return null;
    try {
      const vectors = await this.embedBatch([text]);
      return vectors[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Generate embedding vectors for a batch of texts.
   * Returns an array of the same length (null entries for failures).
   */
  async embedBatch(texts: string[]): Promise<(EmbeddingVector | null)[]> {
    if (!this.apiKey || texts.length === 0) {
      return texts.map(() => null);
    }

    const results: (EmbeddingVector | null)[] = [];

    // Process in batches to avoid oversized requests
    for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
      try {
        const batchResults = await this.callEmbeddingAPI(batch);
        results.push(...batchResults);
      } catch {
        // Mark entire batch as failed
        results.push(...batch.map(() => null));
      }
    }

    return results;
  }

  private async callEmbeddingAPI(texts: string[]): Promise<(EmbeddingVector | null)[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`;

    const payload = {
      requests: texts.map((text) => ({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      })),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey!,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[EmbeddingClient] API error ${response.status}: ${response.statusText}`);
      return texts.map(() => null);
    }

    const data: any = await response.json();
    if (!data.embeddings || !Array.isArray(data.embeddings)) {
      return texts.map(() => null);
    }

    return data.embeddings.map((e: any) => {
      if (e.values && Array.isArray(e.values)) {
        return { values: e.values };
      }
      return null;
    });
  }
}

/**
 * Compute cosine similarity between two embedding vectors.
 * Returns a value in [-1, 1]; higher means more similar.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
