import { describe, it, expect } from "vitest";
import { classifyAndRoute } from "./ModelManager.js";

describe("ModelManager", () => {
  describe("classifyAndRoute", () => {
    describe("Gemini Provider", () => {
      it("should route simple content to gemini-2.5-flash", () => {
        const result = classifyAndRoute("Hello, how are you?", "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should route complex content with 'refactor' keyword to gemini-2.5-pro", () => {
        const result = classifyAndRoute("Please refactor this code", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should route complex content with 'optimize' keyword to gemini-2.5-pro", () => {
        const result = classifyAndRoute("Optimize the performance", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should route complex content with 'debug' keyword to gemini-2.5-pro", () => {
        const result = classifyAndRoute("Debug this error", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should route long content (>1200 chars) to gemini-2.5-pro", () => {
        const longContent = "a".repeat(1201);
        const result = classifyAndRoute(longContent, "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should route content with exactly 1200 chars to gemini-2.5-flash", () => {
        const content = "a".repeat(1200);
        const result = classifyAndRoute(content, "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should handle case-insensitive provider names", () => {
        const result = classifyAndRoute("Simple task", "GEMINI");
        expect(result).toBe("gemini-2.5-flash");
      });
    });

    describe("OpenAI Provider", () => {
      it("should route simple content to gpt-4o-mini", () => {
        const result = classifyAndRoute("Hello, how are you?", "openai");
        expect(result).toBe("gpt-4o-mini");
      });

      it("should route complex content with 'implement' keyword to gpt-4o", () => {
        const result = classifyAndRoute("Implement a new feature", "openai");
        expect(result).toBe("gpt-4o");
      });

      it("should route complex content with 'fix bug' keyword to gpt-4o", () => {
        const result = classifyAndRoute("Fix bug in authentication", "openai");
        expect(result).toBe("gpt-4o");
      });

      it("should route long content (>1200 chars) to gpt-4o", () => {
        const longContent = "b".repeat(1201);
        const result = classifyAndRoute(longContent, "openai");
        expect(result).toBe("gpt-4o");
      });

      it("should handle case-insensitive provider names", () => {
        const result = classifyAndRoute("Simple task", "OpenAI");
        expect(result).toBe("gpt-4o-mini");
      });
    });

    describe("Claude/Anthropic Provider", () => {
      it("should route simple content to claude-3-5-haiku-latest", () => {
        const result = classifyAndRoute("Hello, how are you?", "claude");
        expect(result).toBe("claude-3-5-haiku-latest");
      });

      it("should route complex content with 'architecture' keyword to claude-3-5-sonnet-latest", () => {
        const result = classifyAndRoute("Design the architecture", "claude");
        expect(result).toBe("claude-3-5-sonnet-latest");
      });

      it("should work with 'anthropic' provider name", () => {
        const result = classifyAndRoute("Simple task", "anthropic");
        expect(result).toBe("claude-3-5-haiku-latest");
      });

      it("should route complex content with 'memory leak' keyword to claude-3-5-sonnet-latest", () => {
        const result = classifyAndRoute("Investigate memory leak", "anthropic");
        expect(result).toBe("claude-3-5-sonnet-latest");
      });

      it("should handle case-insensitive provider names", () => {
        const result = classifyAndRoute("Simple task", "CLAUDE");
        expect(result).toBe("claude-3-5-haiku-latest");
      });
    });

    describe("Complexity Keywords", () => {
      const keywords = [
        "refactor",
        "optimize",
        "debug",
        "error",
        "write tests",
        "implement",
        "fix bug",
        "architecture",
        "race condition",
        "memory leak",
        "performance",
        "class",
        "database",
      ];

      keywords.forEach((keyword) => {
        it(`should detect '${keyword}' as complex and route to pro model`, () => {
          const result = classifyAndRoute(`Please ${keyword} this`, "gemini");
          expect(result).toBe("gemini-2.5-pro");
        });
      });

      it("should handle keywords in mixed case", () => {
        const result = classifyAndRoute("REFACTOR this code", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should handle keywords as part of larger words", () => {
        const result = classifyAndRoute("Let's optimize the refactoring", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });
    });

    describe("Unknown Provider", () => {
      it("should default to gemini-2.5-flash for unknown provider", () => {
        const result = classifyAndRoute("Simple task", "unknown");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should default to gemini-2.5-flash for empty provider", () => {
        const result = classifyAndRoute("Simple task", "");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should default to gemini-2.5-flash even with complex content for unknown provider", () => {
        const result = classifyAndRoute("Refactor this code", "unknown-provider");
        expect(result).toBe("gemini-2.5-flash");
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty content", () => {
        const result = classifyAndRoute("", "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should handle whitespace-only content", () => {
        const result = classifyAndRoute("   ", "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should handle content with multiple complexity keywords", () => {
        const result = classifyAndRoute("Refactor and optimize the database architecture", "gemini");
        expect(result).toBe("gemini-2.5-pro");
      });

      it("should handle content at exactly 1201 characters", () => {
        const content = "x".repeat(1201);
        const result = classifyAndRoute(content, "openai");
        expect(result).toBe("gpt-4o");
      });

      it("should handle special characters in content", () => {
        const result = classifyAndRoute("Simple task with $pecial ch@r$", "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });

      it("should handle unicode characters in content", () => {
        const result = classifyAndRoute("Hello 你好 مرحبا", "gemini");
        expect(result).toBe("gemini-2.5-flash");
      });
    });
  });
});
