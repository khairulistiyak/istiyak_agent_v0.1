import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamManager } from "./StreamManager.js";

describe("StreamManager", () => {
  let stream: StreamManager;

  beforeEach(() => {
    stream = new StreamManager();
  });

  describe("Basic Append and Retrieval", () => {
    it("should accumulate chunks correctly", () => {
      stream.append("Hello ");
      stream.append("World");
      expect(stream.getOutput()).toBe("Hello World");
    });

    it("should return empty string when no chunks appended", () => {
      expect(stream.getOutput()).toBe("");
    });

    it("should handle empty chunks", () => {
      stream.append("");
      expect(stream.getOutput()).toBe("");
    });

    it("should handle single chunk", () => {
      stream.append("Single chunk");
      expect(stream.getOutput()).toBe("Single chunk");
    });

    it("should handle many chunks", () => {
      for (let i = 0; i < 100; i++) {
        stream.append(`chunk${i} `);
      }
      const output = stream.getOutput();
      expect(output).toContain("chunk0");
      expect(output).toContain("chunk99");
    });
  });

  describe("getPartialOutput", () => {
    it("should return same as getOutput", () => {
      stream.append("Partial ");
      stream.append("Output");
      expect(stream.getPartialOutput()).toBe(stream.getOutput());
      expect(stream.getPartialOutput()).toBe("Partial Output");
    });
  });

  describe("getRecentChunks", () => {
    it("should return last N chunks", () => {
      stream.append("a");
      stream.append("b");
      stream.append("c");
      stream.append("d");
      const recent = stream.getRecentChunks(2);
      expect(recent).toEqual(["c", "d"]);
    });

    it("should return all chunks if N is greater than total chunks", () => {
      stream.append("a");
      stream.append("b");
      const recent = stream.getRecentChunks(10);
      expect(recent).toEqual(["a", "b"]);
    });

    it("should return empty array when no chunks", () => {
      const recent = stream.getRecentChunks(5);
      expect(recent).toEqual([]);
    });

    it("should return last chunk when N is 1", () => {
      stream.append("a");
      stream.append("b");
      stream.append("c");
      const recent = stream.getRecentChunks(1);
      expect(recent).toEqual(["c"]);
    });
  });

  describe("Listener Management", () => {
    it("should notify listener when chunk is appended", () => {
      const listener = vi.fn();
      stream.onChunk(listener);
      stream.append("test");
      expect(listener).toHaveBeenCalledWith("test");
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should notify multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      stream.onChunk(listener1);
      stream.onChunk(listener2);
      stream.append("test");
      expect(listener1).toHaveBeenCalledWith("test");
      expect(listener2).toHaveBeenCalledWith("test");
    });

    it("should notify listeners for each chunk", () => {
      const listener = vi.fn();
      stream.onChunk(listener);
      stream.append("a");
      stream.append("b");
      stream.append("c");
      expect(listener).toHaveBeenCalledTimes(3);
      expect(listener).toHaveBeenNthCalledWith(1, "a");
      expect(listener).toHaveBeenNthCalledWith(2, "b");
      expect(listener).toHaveBeenNthCalledWith(3, "c");
    });

    it("should remove listener correctly", () => {
      const listener = vi.fn();
      stream.onChunk(listener);
      stream.append("before");
      stream.removeListener(listener);
      stream.append("after");
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("before");
    });

    it("should handle removing non-existent listener", () => {
      const listener = vi.fn();
      stream.removeListener(listener); // Should not throw
      stream.append("test");
      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const goodListener = vi.fn();
      
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      stream.onChunk(errorListener);
      stream.onChunk(goodListener);
      
      stream.append("test");
      
      expect(errorListener).toHaveBeenCalled();
      expect(goodListener).toHaveBeenCalled(); // Should still be called despite error
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Completion States", () => {
    it("should mark stream as complete", () => {
      expect(stream.isComplete()).toBe(false);
      stream.complete();
      expect(stream.isComplete()).toBe(true);
    });

    it("should not append after completion", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      stream.append("before");
      stream.complete();
      stream.append("after");
      
      expect(stream.getOutput()).toBe("before");
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it("should not notify listeners after completion", () => {
      const listener = vi.fn();
      stream.onChunk(listener);
      
      stream.append("before");
      stream.complete();
      stream.append("after");
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("before");
    });
  });

  describe("Error Handling", () => {
    it("should mark stream as failed with error", () => {
      const error = new Error("Test error");
      stream.fail(error);
      
      expect(stream.hasError()).toBe(true);
      expect(stream.getError()).toBe(error);
      expect(stream.isComplete()).toBe(true);
    });

    it("should not have error initially", () => {
      expect(stream.hasError()).toBe(false);
      expect(stream.getError()).toBeNull();
    });

    it("should not have error after successful completion", () => {
      stream.complete();
      expect(stream.hasError()).toBe(false);
      expect(stream.getError()).toBeNull();
    });

    it("should preserve error message", () => {
      const error = new Error("Custom error message");
      stream.fail(error);
      expect(stream.getError()?.message).toBe("Custom error message");
    });
  });

  describe("Statistics", () => {
    it("should track chunk count", () => {
      stream.append("a");
      stream.append("b");
      stream.append("c");
      const stats = stream.getStats();
      expect(stats.chunkCount).toBe(3);
    });

    it("should track total bytes", () => {
      stream.append("ab");   // 2 bytes
      stream.append("cde");  // 3 bytes
      const stats = stream.getStats();
      expect(stats.totalBytes).toBe(5);
    });

    it("should track total chars", () => {
      stream.append("hello");
      stream.append(" world");
      const stats = stream.getStats();
      expect(stats.totalChars).toBe(11);
    });

    it("should track elapsed time", async () => {
      stream.append("start");
      await new Promise(resolve => setTimeout(resolve, 50));
      stream.append("end");
      
      const stats = stream.getStats();
      expect(stats.elapsedMs).toBeGreaterThan(40);
      expect(stats.elapsedMs).toBeLessThan(200);
    });

    it("should calculate chars per second", async () => {
      stream.append("test");
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const stats = stream.getStats();
      expect(stats.charsPerSecond).toBeGreaterThan(0);
    });

    it("should return 0 chars/sec when no time elapsed", () => {
      const stats = stream.getStats();
      expect(stats.charsPerSecond).toBe(0);
    });

    it("should include completion status in stats", () => {
      let stats = stream.getStats();
      expect(stats.isComplete).toBe(false);
      
      stream.complete();
      stats = stream.getStats();
      expect(stats.isComplete).toBe(true);
    });

    it("should include error status in stats", () => {
      let stats = stream.getStats();
      expect(stats.hasError).toBe(false);
      
      stream.fail(new Error("Test"));
      stats = stream.getStats();
      expect(stats.hasError).toBe(true);
    });
  });

  describe("Clear/Reset", () => {
    it("should reset all state", () => {
      stream.append("test");
      stream.onChunk(() => {});
      stream.complete();
      
      stream.clear();
      
      expect(stream.getOutput()).toBe("");
      expect(stream.isComplete()).toBe(false);
      expect(stream.hasError()).toBe(false);
      expect(stream.getError()).toBeNull();
      
      const stats = stream.getStats();
      expect(stats.chunkCount).toBe(0);
      expect(stats.totalBytes).toBe(0);
      expect(stats.totalChars).toBe(0);
    });

    it("should allow reuse after clear", () => {
      stream.append("first");
      stream.complete();
      stream.clear();
      
      stream.append("second");
      expect(stream.getOutput()).toBe("second");
      expect(stream.isComplete()).toBe(false);
    });

    it("should clear listeners", () => {
      const listener = vi.fn();
      stream.onChunk(listener);
      stream.append("before clear");
      
      stream.clear();
      stream.append("after clear");
      
      // Listener should have been called once before clear, not after
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    it("should handle unicode characters", () => {
      stream.append("Hello 世界 🌍");
      expect(stream.getOutput()).toBe("Hello 世界 🌍");
    });

    it("should handle newlines and special characters", () => {
      stream.append("Line 1\nLine 2\tTabbed");
      expect(stream.getOutput()).toBe("Line 1\nLine 2\tTabbed");
    });

    it("should handle very large chunks", () => {
      const largeChunk = "x".repeat(100000);
      stream.append(largeChunk);
      expect(stream.getOutput().length).toBe(100000);
    });

    it("should handle rapid appends", () => {
      for (let i = 0; i < 1000; i++) {
        stream.append("a");
      }
      expect(stream.getOutput().length).toBe(1000);
      expect(stream.getStats().chunkCount).toBe(1000);
    });
  });
});
