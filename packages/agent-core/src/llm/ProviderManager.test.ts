import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { streamLLM, setMockStreamLLM, mockStreamLLMFn } from "./ProviderManager.js";
import { Message } from "@istiyak/shared-types";

// Mock all provider modules to avoid actual API calls
vi.mock("./providers/gemini/GeminiProvider.js");
vi.mock("./providers/openai/OpenAIProvider.js");
vi.mock("./providers/claude/ClaudeProvider.js");
vi.mock("./providers/ollama/OllamaProvider.js");
vi.mock("./providers/vertex/VertexProvider.js");
vi.mock("./providers/deepseek/DeepseekProvider.js");
vi.mock("./providers/custom/CustomProvider.js");

describe("ProviderManager", () => {
  const sampleMessages: Message[] = [
    { role: "user", content: "Hello, how are you?" },
  ];

  beforeEach(() => {
    // Reset mock before each test
    setMockStreamLLM(null as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Mock System", () => {
    it("should use mock function when set", async () => {
      const mockFn = vi.fn().mockResolvedValue("Mocked response");
      setMockStreamLLM(mockFn);

      const result = await streamLLM(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(result).toBe("Mocked response");
      expect(mockFn).toHaveBeenCalledWith(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );
    });

    it("should pass all parameters to mock function", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      const onChunk = vi.fn();
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "openai",
        "gpt-4o",
        "apiKey",
        "sk-test",
        "/path/to/sa.json",
        "project-123",
        "us-central1",
        onChunk,
        false
      );

      expect(mockFn).toHaveBeenCalledWith(
        sampleMessages,
        "openai",
        "gpt-4o",
        "apiKey",
        "sk-test",
        "/path/to/sa.json",
        "project-123",
        "us-central1",
        onChunk,
        false
      );
    });

    it("should allow clearing mock by setting to null", async () => {
      const mockFn = vi.fn().mockResolvedValue("Mocked");
      setMockStreamLLM(mockFn);
      setMockStreamLLM(null as any);

      // This will now use real provider logic (which is also mocked at module level)
      // So it won't throw, but won't call our mock function
      const { GeminiProvider } = await import("./providers/gemini/GeminiProvider.js");
      const geminiMock = vi.mocked(GeminiProvider);
      geminiMock.prototype.streamGenerateContent = vi.fn().mockResolvedValue("Real provider");

      const result = await streamLLM(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe("Auto-Routing", () => {
    it("should route to complex model when model is 'auto' and content is complex", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      const complexMessages: Message[] = [
        { role: "user", content: "Please refactor this complex codebase" },
      ];

      await streamLLM(
        complexMessages,
        "gemini",
        "auto",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      // Should route to pro model due to "refactor" keyword
      expect(mockFn).toHaveBeenCalledWith(
        complexMessages,
        "gemini",
        "gemini-2.5-pro", // auto-routed to pro
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );
    });

    it("should route to simple model when model is 'auto' and content is simple", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      const simpleMessages: Message[] = [
        { role: "user", content: "Hello, how are you?" },
      ];

      await streamLLM(
        simpleMessages,
        "gemini",
        "auto",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(mockFn).toHaveBeenCalledWith(
        simpleMessages,
        "gemini",
        "gemini-2.5-flash", // auto-routed to flash
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );
    });

    it("should support 'auto-route' as model name", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "openai",
        "auto-route",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(mockFn).toHaveBeenCalledWith(
        sampleMessages,
        "openai",
        "gpt-4o-mini", // auto-routed
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );
    });

    it("should handle empty messages for auto-routing", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      await streamLLM(
        [],
        "gemini",
        "auto",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      // Should default to flash when no user message
      expect(mockFn).toHaveBeenCalledWith(
        [],
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "test-key",
        "",
        "",
        "",
        undefined,
        true
      );
    });
  });

  describe("Provider Routing", () => {
    it("should throw error for unsupported provider", async () => {
      await expect(
        streamLLM(
          sampleMessages,
          "unsupported-provider",
          "model-name",
          "apiKey",
          "test-key",
          "",
          "",
          "",
          undefined,
          true
        )
      ).rejects.toThrow("Unsupported provider: unsupported-provider");
    });

    it("should include list of supported providers in error message", async () => {
      await expect(
        streamLLM(
          sampleMessages,
          "invalid",
          "model",
          "apiKey",
          "key",
          "",
          "",
          "",
          undefined,
          true
        )
      ).rejects.toThrow("Supported: gemini, openai, claude, ollama, deepseek, custom");
    });

    it("should handle case-insensitive provider names", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      const providers = ["GEMINI", "OpenAI", "CLAUDE", "ollama", "DeepSeek"];

      for (const provider of providers) {
        await streamLLM(
          sampleMessages,
          provider,
          "model",
          "apiKey",
          "key",
          "",
          "",
          "",
          undefined,
          true
        );
      }

      expect(mockFn).toHaveBeenCalledTimes(providers.length);
    });

    it("should accept 'anthropic' as alias for 'claude'", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "anthropic",
        "claude-3-5-sonnet-latest",
        "apiKey",
        "key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe("Authentication Methods", () => {
    it("should use Vertex provider for Gemini with serviceAccount auth", async () => {
      const { VertexProvider } = await import("./providers/vertex/VertexProvider.js");
      const vertexMock = vi.mocked(VertexProvider);
      const streamGenerateMock = vi.fn().mockResolvedValue("Vertex response");
      vertexMock.prototype.streamGenerate = streamGenerateMock;

      // Clear mock to use real provider logic
      setMockStreamLLM(null as any);

      await streamLLM(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "serviceAccount",
        "",
        "/path/to/sa.json",
        "my-project",
        "us-central1",
        undefined,
        true
      );

      expect(VertexProvider).toHaveBeenCalledWith(
        "/path/to/sa.json",
        "my-project",
        "us-central1"
      );
      expect(streamGenerateMock).toHaveBeenCalled();
    });

    it("should use Gemini provider for Gemini with apiKey auth", async () => {
      const { GeminiProvider } = await import("./providers/gemini/GeminiProvider.js");
      const geminiMock = vi.mocked(GeminiProvider);
      const streamMock = vi.fn().mockResolvedValue("Gemini response");
      geminiMock.prototype.streamGenerateContent = streamMock;

      setMockStreamLLM(null as any);

      await streamLLM(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "AIza-test-key",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(GeminiProvider).toHaveBeenCalledWith("AIza-test-key");
      expect(streamMock).toHaveBeenCalled();
    });
  });

  describe("Callbacks and Options", () => {
    it("should pass onChunk callback to provider", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      const onChunk = vi.fn();
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "gemini",
        "gemini-2.5-flash",
        "apiKey",
        "key",
        "",
        "",
        "",
        onChunk,
        true
      );

      expect(mockFn).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        onChunk,
        expect.anything()
      );
    });

    it("should pass jsonMode parameter", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "gemini",
        "model",
        "apiKey",
        "key",
        "",
        "",
        "",
        undefined,
        false // jsonMode = false
      );

      expect(mockFn).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        false
      );
    });

    it("should default jsonMode to true", async () => {
      const mockFn = vi.fn().mockResolvedValue("Response");
      setMockStreamLLM(mockFn);

      await streamLLM(
        sampleMessages,
        "gemini",
        "model",
        "apiKey",
        "key",
        "",
        "",
        ""
        // No jsonMode parameter
      );

      expect(mockFn).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        undefined,
        true // Should default to true
      );
    });
  });

  describe("Custom Provider", () => {
    it("should parse URL from apiKey for custom provider", async () => {
      const { CustomProvider } = await import("./providers/custom/CustomProvider.js");
      const customMock = vi.mocked(CustomProvider);
      const streamMock = vi.fn().mockResolvedValue("Custom response");
      customMock.prototype.streamChat = streamMock;

      setMockStreamLLM(null as any);

      await streamLLM(
        sampleMessages,
        "custom",
        "model",
        "apiKey",
        "http://localhost:11434",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(CustomProvider).toHaveBeenCalledWith({
        baseUrl: "http://localhost:11434",
        apiKey: undefined,
      });
    });

    it("should handle custom provider with non-URL apiKey", async () => {
      const { CustomProvider } = await import("./providers/custom/CustomProvider.js");
      const customMock = vi.mocked(CustomProvider);

      setMockStreamLLM(null as any);

      await streamLLM(
        sampleMessages,
        "custom",
        "model",
        "apiKey",
        "localhost:11434",
        "",
        "",
        "",
        undefined,
        true
      );

      expect(CustomProvider).toHaveBeenCalledWith({
        baseUrl: "http://localhost:11434",
        apiKey: "localhost:11434",
      });
    });
  });
});
