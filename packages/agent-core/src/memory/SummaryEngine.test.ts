import { describe, it, expect } from "vitest";
import { SummaryEngine } from "./SummaryEngine.js";

describe("SummaryEngine", () => {
  describe("summarizeAdvanced", () => {
    it("should return empty string for empty input", () => {
      expect(SummaryEngine.summarizeAdvanced("")).toBe("");
      expect(SummaryEngine.summarizeAdvanced("   ")).toBe("");
    });

    it("should return the original text if it has fewer sentences than maxSentences", () => {
      const text = "This is sentence one. This is sentence two.";
      const summary = SummaryEngine.summarizeAdvanced(text, 5);
      expect(summary).toContain("This is sentence one");
      expect(summary).toContain("This is sentence two");
    });

    it("should extract important sentences using TF-IDF", () => {
      const sentences = [
        "First sentence sets general context.",
        "Error occurs on line 42 inside database client.",
        "This middle sentence is relatively unimportant filler.",
        "Another filler sentence that doesn't say much.",
        "Critical warning shows high memory usage.",
        "Last sentence has conclusion."
      ];
      const text = sentences.join(". ");
      const summary = SummaryEngine.summarizeAdvanced(text, 3);
      // Verify that the first sentence (which receives the highest position boost) is correctly preserved
      expect(summary).toContain("First sentence sets general context");
    });
  });

  describe("summarizeConversation", () => {
    it("should handle conversation message formatting", () => {
      const messages = [
        { role: "user", content: "hello world" },
        { role: "assistant", content: "hi there" }
      ];
      const summary = SummaryEngine.summarizeConversation(messages);
      expect(summary).toContain("[User] hello world");
      expect(summary).toContain("[AI] hi there");
    });
  });
});
