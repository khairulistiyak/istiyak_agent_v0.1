import { describe, it, expect } from "vitest";
import { estimateTokens, countTokensForMessages, fitsInTokenBudget } from "./TokenCounter.js";
import { Message } from "@istiyak/shared-types";

describe("TokenCounter", () => {
  describe("estimateTokens", () => {
    it("should return 0 for empty or null strings", () => {
      expect(estimateTokens("")).toBe(0);
      expect(estimateTokens(null as any)).toBe(0);
    });

    it("should count normal english words", () => {
      const text = "hello world this is a test";
      // 6 words * 1.3 = 7.8 -> ceil is 8
      expect(estimateTokens(text)).toBe(8);
    });

    it("should handle special code characters", () => {
      const code = "const x = { a: 1 };";
      const count = estimateTokens(code);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("countTokensForMessages", () => {
    it("should return 0 for empty messages list", () => {
      expect(countTokensForMessages([])).toBe(0);
      expect(countTokensForMessages(null as any)).toBe(0);
    });

    it("should include overhead per message", () => {
      const messages: Message[] = [
        { role: "user", content: "hello" }
      ];
      // 1 message: 4 (overhead) + 2 (token estimation for 'hello') + 3 (overall overhead) = 9
      expect(countTokensForMessages(messages)).toBe(9);
    });
  });

  describe("fitsInTokenBudget", () => {
    it("should correctly check budget fit", () => {
      const messages: Message[] = [
        { role: "user", content: "hello world" }
      ];
      expect(fitsInTokenBudget(messages, 20)).toBe(true);
      expect(fitsInTokenBudget(messages, 5)).toBe(false);
    });
  });
});
