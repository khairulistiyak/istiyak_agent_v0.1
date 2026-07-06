import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EmbeddingClient, cosineSimilarity, EmbeddingVector } from "../EmbeddingClient.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("EmbeddingClient", () => {
  let client: EmbeddingClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Constructor and Availability", () => {
    it("should create client with API key", () => {
      client = new EmbeddingClient("test-api-key");
      expect(client.isAvailable()).toBe(true);
    });

    it("should create client without API key", () => {
      client = new EmbeddingClient();
      expect(client.isAvailable()).toBe(false);
    });

    it("should handle empty string API key", () => {
      client = new EmbeddingClient("");
      expect(client.isAvailable()).toBe(false);
    });

    it("should handle undefined API key", () => {
      client = new EmbeddingClient(undefined);
      expect(client.isAvailable()).toBe(false);
    });
  });

  describe("embed", () => {
    it("should return null when no API key", async () => {
      client = new EmbeddingClient();
      const result = await client.embed("test text");
      expect(result).toBeNull();
    });

    it("should call embedBatch with single text", async () => {
      client = new EmbeddingClient("test-key");
      const embedBatchSpy = vi.spyOn(client, "embedBatch").mockResolvedValue([
        { values: [0.1, 0.2, 0.3] }
      ]);

      await client.embed("test text");

      expect(embedBatchSpy).toHaveBeenCalledWith(["test text"]);
    });

    it("should return first embedding from batch", async () => {
      client = new EmbeddingClient("test-key");
      vi.spyOn(client, "embedBatch").mockResolvedValue([
        { values: [0.1, 0.2, 0.3] }
      ]);

      const result = await client.embed("test text");

      expect(result).toEqual({ values: [0.1, 0.2, 0.3] });
    });

    it("should return null if embedBatch returns empty array", async () => {
      client = new EmbeddingClient("test-key");
      vi.spyOn(client, "embedBatch").mockResolvedValue([]);

      const result = await client.embed("test text");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      client = new EmbeddingClient("test-key");
      vi.spyOn(client, "embedBatch").mockRejectedValue(new Error("API error"));

      const result = await client.embed("test text");

      expect(result).toBeNull();
    });
  });

  describe("embedBatch", () => {
    it("should return array of nulls when no API key", async () => {
      client = new EmbeddingClient();
      const result = await client.embedBatch(["text1", "text2", "text3"]);

      expect(result).toEqual([null, null, null]);
    });

    it("should return empty array for empty input", async () => {
      client = new EmbeddingClient("test-key");
      const result = await client.embedBatch([]);

      expect(result).toEqual([]);
    });

    it("should process single batch successfully", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          embeddings: [
            { values: [0.1, 0.2] },
            { values: [0.3, 0.4] }
          ]
        }),
      } as Response);

      const result = await client.embedBatch(["text1", "text2"]);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ values: [0.1, 0.2] });
      expect(result[1]).toEqual({ values: [0.3, 0.4] });
    });

    it("should process multiple batches (>10 texts)", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          embeddings: Array(10).fill({ values: [0.1, 0.2] })
        }),
      } as Response);

      const texts = Array(25).fill("test");
      const result = await client.embedBatch(texts);

      expect(result.length).toBe(25);
      expect(fetch).toHaveBeenCalledTimes(3); // 3 batches: 10 + 10 + 5
    });

    it("should handle API errors gracefully", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      const result = await client.embedBatch(["text1", "text2"]);

      expect(result).toEqual([null, null]);
    });

    it("should handle network errors gracefully", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      const result = await client.embedBatch(["text1", "text2"]);

      expect(result).toEqual([null, null]);
    });

    it("should handle malformed API response", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "response" }),
      } as Response);

      const result = await client.embedBatch(["text1"]);

      expect(result).toEqual([null]);
    });

    it("should handle partial failures in batch", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          embeddings: [
            { values: [0.1, 0.2] },
            { invalid: "data" }, // Missing values
            { values: [0.3, 0.4] }
          ]
        }),
      } as Response);

      const result = await client.embedBatch(["text1", "text2", "text3"]);

      expect(result[0]).toEqual({ values: [0.1, 0.2] });
      expect(result[1]).toBeNull();
      expect(result[2]).toEqual({ values: [0.3, 0.4] });
    });

    it("should make correct API request", async () => {
      client = new EmbeddingClient("test-api-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ embeddings: [{ values: [0.1] }] }),
      } as Response);

      await client.embedBatch(["test text"]);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("text-embedding-004:batchEmbedContents"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-goog-api-key": "test-api-key",
          }),
          body: expect.any(String),
        })
      );
    });

    it("should send correct payload structure", async () => {
      client = new EmbeddingClient("test-api-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ embeddings: [{ values: [0.1] }] }),
      } as Response);

      await client.embedBatch(["test text"]);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]!.body as string);

      expect(body.requests).toBeInstanceOf(Array);
      expect(body.requests[0]).toHaveProperty("model");
      expect(body.requests[0]).toHaveProperty("content");
      expect(body.requests[0].content.parts[0].text).toBe("test text");
    });
  });

  describe("cosineSimilarity", () => {
    it("should calculate similarity for identical vectors", () => {
      const vec = [1, 2, 3];
      const similarity = cosineSimilarity(vec, vec);
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it("should calculate similarity for orthogonal vectors", () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(0.0, 5);
    });

    it("should calculate similarity for opposite vectors", () => {
      const vec1 = [1, 2, 3];
      const vec2 = [-1, -2, -3];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(-1.0, 5);
    });

    it("should calculate similarity for similar vectors", () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2, 2.9];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThan(0.99);
    });

    it("should return 0 for vectors of different lengths", () => {
      const vec1 = [1, 2, 3];
      const vec2 = [1, 2];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBe(0);
    });

    it("should return 0 for empty vectors", () => {
      const similarity = cosineSimilarity([], []);
      expect(similarity).toBe(0);
    });

    it("should return 0 for zero vectors", () => {
      const vec1 = [0, 0, 0];
      const vec2 = [1, 2, 3];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBe(0);
    });

    it("should handle negative values", () => {
      const vec1 = [-1, -2, -3];
      const vec2 = [1, 2, 3];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(-1.0, 5);
    });

    it("should handle decimal values", () => {
      const vec1 = [0.1, 0.2, 0.3];
      const vec2 = [0.4, 0.5, 0.6];
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it("should handle large vectors", () => {
      const vec1 = Array(768).fill(0.5);
      const vec2 = Array(768).fill(0.5);
      const similarity = cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(1.0, 5);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long text", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ embeddings: [{ values: [0.1] }] }),
      } as Response);

      const longText = "word ".repeat(10000);
      const result = await client.embed(longText);

      expect(result).toBeDefined();
    });

    it("should handle special characters", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ embeddings: [{ values: [0.1] }] }),
      } as Response);

      const result = await client.embed("Hello 世界 🌍 مرحبا");

      expect(result).toBeDefined();
    });

    it("should handle empty string", async () => {
      client = new EmbeddingClient("test-key");

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ embeddings: [{ values: [0.1] }] }),
      } as Response);

      const result = await client.embed("");

      expect(result).toBeDefined();
    });
  });
});
