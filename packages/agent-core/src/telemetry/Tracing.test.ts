import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Tracing, Span } from "./Tracing.js";

describe("Tracing", () => {
  beforeEach(() => {
    // Clear all spans before each test
    Tracing.clear();
  });

  afterEach(() => {
    // Clean up after each test
    Tracing.clear();
  });

  describe("Span Creation", () => {
    it("should create a new span with startSpan", () => {
      const span = Tracing.startSpan("test-span");
      
      expect(span).toBeDefined();
      expect(span.name).toBe("test-span");
      expect(span.status).toBe("running");
      expect(span.startTime).toBeGreaterThan(0);
      expect(span.endTime).toBe(0);
      expect(span.duration).toBe(0);
      expect(span.logs).toEqual([]);
      expect(span.children).toEqual([]);
    });

    it("should have end method", () => {
      const span = Tracing.startSpan("test");
      expect(typeof span.end).toBe("function");
    });

    it("should have log method", () => {
      const span = Tracing.startSpan("test");
      expect(typeof span.log).toBe("function");
    });

    it("should have startChild method", () => {
      const span = Tracing.startSpan("test");
      expect(typeof span.startChild).toBe("function");
    });

    it("should add span to active spans", () => {
      const span = Tracing.startSpan("test");
      const activeSpans = Tracing.getActiveSpans();
      
      expect(activeSpans).toContain(span);
      expect(activeSpans.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Span Completion", () => {
    it("should mark span as completed when ended", () => {
      const span = Tracing.startSpan("test");
      span.end();
      
      expect(span.status).toBe("completed");
    });

    it("should calculate duration when ended", async () => {
      const span = Tracing.startSpan("test");
      await new Promise(resolve => setTimeout(resolve, 50));
      span.end();
      
      expect(span.duration).toBeGreaterThan(40);
      expect(span.duration).toBeLessThan(200);
    });

    it("should set endTime when ended", () => {
      const span = Tracing.startSpan("test");
      span.end();
      
      expect(span.endTime).toBeGreaterThan(span.startTime);
    });

    it("should move span from active to completed", () => {
      const span = Tracing.startSpan("test");
      const initialActiveCount = Tracing.getActiveSpans().length;
      
      span.end();
      
      const activeSpans = Tracing.getActiveSpans();
      const completedSpans = Tracing.getCompletedSpans();
      
      expect(activeSpans).not.toContain(span);
      expect(completedSpans).toContain(span);
    });

    it("should mark span as error if error property is set", () => {
      const span = Tracing.startSpan("test");
      (span as any).error = "Something went wrong";
      span.end();
      
      expect(span.status).toBe("error");
    });
  });

  describe("Span Logging", () => {
    it("should add log entry to span", () => {
      const span = Tracing.startSpan("test");
      span.log("Test message");
      
      expect(span.logs.length).toBe(1);
      expect(span.logs[0].message).toBe("Test message");
      expect(span.logs[0].timestamp).toBeGreaterThan(0);
    });

    it("should add multiple log entries", () => {
      const span = Tracing.startSpan("test");
      span.log("First");
      span.log("Second");
      span.log("Third");
      
      expect(span.logs.length).toBe(3);
      expect(span.logs[0].message).toBe("First");
      expect(span.logs[1].message).toBe("Second");
      expect(span.logs[2].message).toBe("Third");
    });

    it("should preserve log order", () => {
      const span = Tracing.startSpan("test");
      
      for (let i = 0; i < 10; i++) {
        span.log(`Message ${i}`);
      }
      
      span.logs.forEach((log, index) => {
        expect(log.message).toBe(`Message ${index}`);
      });
    });

    it("should timestamp each log entry", () => {
      const span = Tracing.startSpan("test");
      const before = Date.now();
      span.log("Test");
      const after = Date.now();
      
      expect(span.logs[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(span.logs[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("Child Spans", () => {
    it("should create child span", () => {
      const parent = Tracing.startSpan("parent");
      const child = parent.startChild("child");
      
      expect(child).toBeDefined();
      expect(child.name).toBe("child");
      expect(parent.children).toContain(child);
    });

    it("should support multiple children", () => {
      const parent = Tracing.startSpan("parent");
      const child1 = parent.startChild("child1");
      const child2 = parent.startChild("child2");
      const child3 = parent.startChild("child3");
      
      expect(parent.children.length).toBe(3);
      expect(parent.children).toContain(child1);
      expect(parent.children).toContain(child2);
      expect(parent.children).toContain(child3);
    });

    it("should support nested children", () => {
      const parent = Tracing.startSpan("parent");
      const child = parent.startChild("child");
      const grandchild = child.startChild("grandchild");
      
      expect(parent.children).toContain(child);
      expect(child.children).toContain(grandchild);
    });

    it("should allow child spans to have independent duration", async () => {
      const parent = Tracing.startSpan("parent");
      const child = parent.startChild("child");
      
      await new Promise(resolve => setTimeout(resolve, 50));
      child.end();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      parent.end();
      
      expect(child.duration).toBeLessThan(parent.duration);
    });
  });

  describe("Active and Completed Spans", () => {
    it("should return copy of active spans", () => {
      const span1 = Tracing.startSpan("span1");
      const activeSpans = Tracing.getActiveSpans();
      
      // Modify returned array should not affect internal state
      activeSpans.push({} as Span);
      
      const activeSpans2 = Tracing.getActiveSpans();
      expect(activeSpans2.length).not.toBe(activeSpans.length);
    });

    it("should return last N completed spans", () => {
      for (let i = 0; i < 10; i++) {
        const span = Tracing.startSpan(`span-${i}`);
        span.end();
      }
      
      const completed = Tracing.getCompletedSpans(5);
      expect(completed.length).toBe(5);
    });

    it("should default to 20 completed spans", () => {
      for (let i = 0; i < 30; i++) {
        const span = Tracing.startSpan(`span-${i}`);
        span.end();
      }
      
      const completed = Tracing.getCompletedSpans();
      expect(completed.length).toBe(20);
    });

    it("should return most recent completed spans", () => {
      for (let i = 0; i < 25; i++) {
        const span = Tracing.startSpan(`span-${i}`);
        span.end();
      }
      
      const completed = Tracing.getCompletedSpans(5);
      
      // Should contain the last 5 spans (20-24)
      expect(completed[0].name).toContain("span-20");
      expect(completed[4].name).toContain("span-24");
    });
  });

  describe("Span Pruning", () => {
    it("should limit completed spans to MAX_COMPLETED_SPANS (200)", () => {
      // Create more than 200 spans
      for (let i = 0; i < 250; i++) {
        const span = Tracing.startSpan(`span-${i}`);
        span.end();
      }
      
      const stats = Tracing.getStats();
      expect(stats.completedCount).toBe(200);
    });

    it("should remove oldest spans when pruning", () => {
      // Create 205 spans
      for (let i = 0; i < 205; i++) {
        const span = Tracing.startSpan(`span-${i}`);
        span.end();
      }
      
      const completed = Tracing.getCompletedSpans(200);
      
      // First 5 spans should be pruned
      const hasFirstSpan = completed.some(s => s.name === "span-0");
      expect(hasFirstSpan).toBe(false);
      
      // Recent spans should still exist
      const hasRecentSpan = completed.some(s => s.name === "span-204");
      expect(hasRecentSpan).toBe(true);
    });
  });

  describe("formatTraceTree", () => {
    it("should format simple span", () => {
      const span = Tracing.startSpan("test");
      span.end();
      
      const tree = Tracing.formatTraceTree(span);
      
      expect(tree).toContain("test");
      expect(tree).toContain("✓"); // completed icon
    });

    it("should show running status", () => {
      const span = Tracing.startSpan("test");
      
      const tree = Tracing.formatTraceTree(span);
      
      expect(tree).toContain("⏳"); // running icon
      expect(tree).toContain("running...");
    });

    it("should show error status", () => {
      const span = Tracing.startSpan("test");
      (span as any).error = "Test error";
      span.end();
      
      const tree = Tracing.formatTraceTree(span);
      
      expect(tree).toContain("✗"); // error icon
      expect(tree).toContain("Test error");
    });

    it("should show duration", () => {
      const span = Tracing.startSpan("test");
      span.end();
      
      const tree = Tracing.formatTraceTree(span);
      
      expect(tree).toMatch(/\d+ms/);
    });

    it("should show logs", () => {
      const span = Tracing.startSpan("test");
      span.log("First log");
      span.log("Second log");
      span.end();
      
      const tree = Tracing.formatTraceTree(span);
      
      expect(tree).toContain("First log");
      expect(tree).toContain("Second log");
      expect(tree).toContain("📝"); // log icon
    });

    it("should show nested children with indentation", () => {
      const parent = Tracing.startSpan("parent");
      const child = parent.startChild("child");
      child.end();
      parent.end();
      
      const tree = Tracing.formatTraceTree(parent);
      
      expect(tree).toContain("parent");
      expect(tree).toContain("child");
      // Child should be indented
      expect(tree).toMatch(/\s+✓ child/);
    });
  });

  describe("Statistics", () => {
    it("should return zero stats when no spans", () => {
      const stats = Tracing.getStats();
      
      expect(stats.activeCount).toBe(0);
      expect(stats.completedCount).toBe(0);
      expect(stats.totalDurationMs).toBe(0);
      expect(stats.avgDurationMs).toBe(0);
      expect(stats.errorCount).toBe(0);
    });

    it("should count active spans", () => {
      Tracing.startSpan("span1");
      Tracing.startSpan("span2");
      
      const stats = Tracing.getStats();
      expect(stats.activeCount).toBe(2);
    });

    it("should count completed spans", () => {
      const span1 = Tracing.startSpan("span1");
      const span2 = Tracing.startSpan("span2");
      span1.end();
      span2.end();
      
      const stats = Tracing.getStats();
      expect(stats.completedCount).toBe(2);
    });

    it("should calculate total duration", () => {
      const span1 = Tracing.startSpan("span1");
      span1.end();
      const span2 = Tracing.startSpan("span2");
      span2.end();
      
      const stats = Tracing.getStats();
      expect(stats.totalDurationMs).toBeGreaterThan(0);
      expect(stats.totalDurationMs).toBe(span1.duration + span2.duration);
    });

    it("should calculate average duration", () => {
      const span1 = Tracing.startSpan("span1");
      span1.end();
      const span2 = Tracing.startSpan("span2");
      span2.end();
      
      const stats = Tracing.getStats();
      const expectedAvg = Math.round((span1.duration + span2.duration) / 2);
      expect(stats.avgDurationMs).toBe(expectedAvg);
    });

    it("should count errors", () => {
      const span1 = Tracing.startSpan("span1");
      (span1 as any).error = "Error 1";
      span1.end();
      
      const span2 = Tracing.startSpan("span2");
      span2.end();
      
      const span3 = Tracing.startSpan("span3");
      (span3 as any).error = "Error 2";
      span3.end();
      
      const stats = Tracing.getStats();
      expect(stats.errorCount).toBe(2);
    });
  });

  describe("Clear", () => {
    it("should clear all active spans", () => {
      Tracing.startSpan("span1");
      Tracing.startSpan("span2");
      
      Tracing.clear();
      
      const activeSpans = Tracing.getActiveSpans();
      expect(activeSpans.length).toBe(0);
    });

    it("should clear all completed spans", () => {
      const span1 = Tracing.startSpan("span1");
      span1.end();
      const span2 = Tracing.startSpan("span2");
      span2.end();
      
      Tracing.clear();
      
      const completedSpans = Tracing.getCompletedSpans();
      expect(completedSpans.length).toBe(0);
    });

    it("should reset stats to zero", () => {
      const span = Tracing.startSpan("span");
      span.end();
      
      Tracing.clear();
      
      const stats = Tracing.getStats();
      expect(stats.activeCount).toBe(0);
      expect(stats.completedCount).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle span with empty name", () => {
      const span = Tracing.startSpan("");
      expect(span.name).toBe("");
    });

    it("should handle span with very long name", () => {
      const longName = "a".repeat(1000);
      const span = Tracing.startSpan(longName);
      expect(span.name).toBe(longName);
    });

    it("should handle log with empty message", () => {
      const span = Tracing.startSpan("test");
      span.log("");
      expect(span.logs[0].message).toBe("");
    });

    it("should handle immediate span end", () => {
      const span = Tracing.startSpan("test");
      span.end();
      
      // Duration should be very small but >= 0
      expect(span.duration).toBeGreaterThanOrEqual(0);
      expect(span.duration).toBeLessThan(100);
    });

    it("should handle multiple end calls on same span", () => {
      const span = Tracing.startSpan("test");
      span.end();
      const firstDuration = span.duration;
      
      // Calling end again shouldn't change duration
      span.end();
      expect(span.duration).toBe(firstDuration);
    });
  });
});
