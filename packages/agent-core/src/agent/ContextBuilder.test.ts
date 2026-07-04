import { describe, it, expect, vi } from "vitest";
import { ContextBuilder, compressHistory } from "./ContextBuilder.js";
import { Message } from "@istiyak/shared-types";

// Mock Limits configuration to have a low history threshold
vi.mock("../config/Limits.js", () => {
  return {
    LIMITS: {
      MAX_HISTORY_TOKENS: 100,
      MAX_STEPS: 15
    }
  };
});

// Mock SummaryEngine
vi.mock("../memory/SummaryEngine.js", () => {
  return {
    SummaryEngine: {
      summarize: vi.fn((text: string) => "Summarized: " + text.substring(0, 20))
    }
  };
});

describe("ContextBuilder", () => {
  describe("compressHistory", () => {
    it("should compress history when it exceeds limits", () => {
      const messages: Message[] = [
        { role: "system", content: "system prompt", id: "sys" },
        { role: "user", content: "msg1".repeat(50), id: "m1" },
        { role: "assistant", content: "msg2".repeat(50), id: "m2" },
        { role: "user", content: "msg3".repeat(50), id: "m3" },
        { role: "assistant", content: "msg4".repeat(50), id: "m4" },
        { role: "user", content: "msg5".repeat(50), id: "m5" },
        { role: "assistant", content: "msg6".repeat(50), id: "m6" },
        { role: "user", content: "msg7".repeat(50), id: "m7" }
      ];
      // Force compression logic to run
      const compressed = compressHistory(messages);
      expect(compressed.length).toBeLessThan(messages.length);
      expect(compressed[0].id).toBe("sys");
      expect(compressed[1].content).toContain("msg1"); // first message kept
      expect(compressed[2].content).toContain("Intermediate message history compressed");
    });
  });

  describe("buildOptimizedContext", () => {
    it("should truncate extremely long tool responses", () => {
      const longToolResponse = "[System Tool Response] " + "A".repeat(15000);
      const messages: Message[] = [
        { role: "user" as const, content: longToolResponse }
      ];
      const result = ContextBuilder.buildOptimizedContext(messages);
      expect(result[0].content.length).toBeLessThan(15000);
      expect(result[0].content).toContain("[... output truncated for context length ...]");
    });

    it("should summarize older messages if they exceed token budget", () => {
      const messages: Message[] = [
        { role: "system" as const, content: "System instructions" },
        ...Array.from({ length: 15 }, (_, i) => ({
          role: "user" as const,
          content: `This is conversation message number ${i}. `.repeat(20)
        }))
      ];
      
      // Call buildOptimizedContext with a tiny token budget to force summary
      const result = ContextBuilder.buildOptimizedContext(messages, 500);
      expect(result.some(m => m.content.includes("[Previous conversation summary]"))).toBe(true);
    });
  });
});
