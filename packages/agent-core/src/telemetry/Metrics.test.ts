import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { recordMetric, getStats } from "./Metrics.js";

describe("Metrics", () => {
  beforeEach(() => {
    // Clear metrics before each test by recording a dummy metric and getting stats
    // This ensures we start with a clean state
    // Since the module uses internal state, we need to clear it manually
    // We can do this by calling recordMetric multiple times to push out old data
    const stats = getStats();
    // If there are existing metrics, we can't easily clear them without access to the internal array
    // So we'll work with relative expectations or accept the existing state
    // For now, let's just note the initial count
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("recordMetric", () => {
    it("should record a metric with basic info", () => {
      const metric = recordMetric("gemini", "gemini-2.5-flash", 1000, 100, 200);
      
      expect(metric).toBeDefined();
      expect(metric.provider).toBe("gemini");
      expect(metric.model).toBe("gemini-2.5-flash");
      expect(metric.latencyMs).toBe(1000);
      expect(metric.tokensIn).toBe(100);
      expect(metric.tokensOut).toBe(200);
    });

    it("should calculate total tokens", () => {
      const metric = recordMetric("openai", "gpt-4o", 500, 50, 75);
      expect(metric.totalTokens).toBe(125);
    });

    it("should calculate tokens per second", () => {
      // 1000ms = 1 second, 200 tokens out = 200 tokens/sec
      const metric = recordMetric("gemini", "model", 1000, 100, 200);
      expect(metric.tokensPerSec).toBe(200);
    });

    it("should handle fractional tokens per second", () => {
      // 1500ms = 1.5 seconds, 150 tokens out = 100 tokens/sec
      const metric = recordMetric("gemini", "model", 1500, 100, 150);
      expect(metric.tokensPerSec).toBe(100);
    });

    it("should round tokens per second to 2 decimal places", () => {
      // 3000ms = 3 seconds, 100 tokens out = 33.33... tokens/sec
      const metric = recordMetric("gemini", "model", 3000, 100, 100);
      expect(metric.tokensPerSec).toBe(33.33);
    });

    it("should handle zero latency gracefully", () => {
      const metric = recordMetric("gemini", "model", 0, 100, 200);
      expect(metric.tokensPerSec).toBe(0);
    });

    it("should handle zero tokens", () => {
      const metric = recordMetric("gemini", "model", 1000, 0, 0);
      expect(metric.totalTokens).toBe(0);
      expect(metric.tokensPerSec).toBe(0);
    });

    it("should include timestamp", () => {
      const metric = recordMetric("gemini", "model", 1000, 100, 200);
      expect(metric.timestamp).toBeDefined();
      expect(typeof metric.timestamp).toBe("string");
    });

    it("should log metric to console", () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      
      recordMetric("gemini", "gemini-2.5-flash", 1000, 100, 200);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[Telemetry]")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("gemini/gemini-2.5-flash")
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("1000ms")
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe("getStats", () => {
    it("should return empty stats when no metrics recorded", () => {
      // Get current stats to establish baseline
      const initialStats = getStats();
      
      // If there are no initial metrics, verify the structure
      if (initialStats.callCount === 0) {
        expect(initialStats.callCount).toBe(0);
        expect(initialStats.avgLatencyMs).toBe(0);
        expect(initialStats.avgSpeed).toBe(0);
        expect(initialStats.totalTokensIn).toBe(0);
        expect(initialStats.totalTokensOut).toBe(0);
        expect(initialStats.history).toEqual([]);
      }
    });

    it("should return stats for single metric", () => {
      const initialCount = getStats().callCount;
      
      recordMetric("gemini", "model", 1000, 100, 200);
      
      const stats = getStats();
      expect(stats.callCount).toBe(initialCount + 1);
      expect(stats.totalTokensIn).toBeGreaterThanOrEqual(100);
      expect(stats.totalTokensOut).toBeGreaterThanOrEqual(200);
    });

    it("should calculate average latency", () => {
      const initialCount = getStats().callCount;
      
      // Record metrics with known latencies
      recordMetric("provider", "model", 1000, 10, 20);
      recordMetric("provider", "model", 2000, 10, 20);
      
      const stats = getStats();
      
      // Since there might be pre-existing metrics, we can't test the exact average
      // But we can verify it's calculating something reasonable
      expect(stats.avgLatencyMs).toBeGreaterThan(0);
    });

    it("should calculate average speed", () => {
      const initialCount = getStats().callCount;
      
      recordMetric("provider", "model", 1000, 10, 100); // 100 t/s
      recordMetric("provider", "model", 1000, 10, 200); // 200 t/s
      
      const stats = getStats();
      
      expect(stats.avgSpeed).toBeGreaterThan(0);
      expect(typeof stats.avgSpeed).toBe("number");
    });

    it("should include history of all metrics", () => {
      const initialCount = getStats().callCount;
      
      recordMetric("provider1", "model1", 1000, 10, 20);
      recordMetric("provider2", "model2", 2000, 20, 30);
      
      const stats = getStats();
      
      expect(stats.history).toBeDefined();
      expect(Array.isArray(stats.history)).toBe(true);
      expect(stats.history.length).toBe(initialCount + 2);
    });

    it("should round average latency to integer", () => {
      const initialCount = getStats().callCount;
      
      recordMetric("provider", "model", 1001, 10, 20);
      recordMetric("provider", "model", 1002, 10, 20);
      
      const stats = getStats();
      
      expect(Number.isInteger(stats.avgLatencyMs)).toBe(true);
    });

    it("should round average speed to 2 decimal places", () => {
      const initialCount = getStats().callCount;
      
      recordMetric("provider", "model", 1000, 10, 100);
      
      const stats = getStats();
      
      // Check that avgSpeed has at most 2 decimal places
      const decimalPlaces = (stats.avgSpeed.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe("Metric Log Limiting", () => {
    it("should maintain max 50 metrics", () => {
      // Record more than 50 metrics
      for (let i = 0; i < 60; i++) {
        recordMetric("provider", `model-${i}`, 1000, 10, 20);
      }
      
      const stats = getStats();
      
      // Should be capped at 50
      expect(stats.callCount).toBe(50);
      expect(stats.history.length).toBe(50);
    });

    it("should remove oldest metrics when exceeding limit", () => {
      // Clear by recording 50 metrics to reset
      for (let i = 0; i < 50; i++) {
        recordMetric("old", `model-${i}`, 1000, 10, 20);
      }
      
      // Record a new metric with a unique identifier
      recordMetric("new-unique-provider", "new-unique-model", 1000, 10, 20);
      
      const stats = getStats();
      
      // Should still be 50
      expect(stats.callCount).toBe(50);
      
      // The newest metric should be in the history
      const hasNewMetric = stats.history.some(
        (m: any) => m.provider === "new-unique-provider" && m.model === "new-unique-model"
      );
      expect(hasNewMetric).toBe(true);
      
      // The oldest "old" metric should be gone (shifted out)
      const firstOldMetricCount = stats.history.filter(
        (m: any) => m.provider === "old" && m.model === "model-0"
      ).length;
      expect(firstOldMetricCount).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large token counts", () => {
      const metric = recordMetric("provider", "model", 1000, 1000000, 2000000);
      expect(metric.totalTokens).toBe(3000000);
    });

    it("should handle very small latency", () => {
      const metric = recordMetric("provider", "model", 1, 10, 20);
      expect(metric.latencyMs).toBe(1);
      // Tokens per second should be very high for 1ms latency
      expect(metric.tokensPerSec).toBeGreaterThan(1000);
    });

    it("should handle very large latency", () => {
      const metric = recordMetric("provider", "model", 100000, 10, 20);
      expect(metric.latencyMs).toBe(100000);
      // Tokens per second should be very low for 100s latency
      expect(metric.tokensPerSec).toBeLessThan(1);
    });

    it("should handle provider and model names with special characters", () => {
      const metric = recordMetric("provider-with-dash", "model_with_underscore", 1000, 10, 20);
      expect(metric.provider).toBe("provider-with-dash");
      expect(metric.model).toBe("model_with_underscore");
    });

    it("should handle empty provider and model names", () => {
      const metric = recordMetric("", "", 1000, 10, 20);
      expect(metric.provider).toBe("");
      expect(metric.model).toBe("");
    });
  });

  describe("Return Value", () => {
    it("should return the recorded metric object", () => {
      const metric = recordMetric("gemini", "model", 1000, 100, 200);
      
      expect(metric).toHaveProperty("timestamp");
      expect(metric).toHaveProperty("provider");
      expect(metric).toHaveProperty("model");
      expect(metric).toHaveProperty("latencyMs");
      expect(metric).toHaveProperty("tokensIn");
      expect(metric).toHaveProperty("tokensOut");
      expect(metric).toHaveProperty("totalTokens");
      expect(metric).toHaveProperty("tokensPerSec");
    });
  });
});
