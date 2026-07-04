import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UsageTracker } from "./UsageTracker.js";
import fs from "fs";

describe("UsageTracker", () => {
  beforeEach(() => {
    UsageTracker.clear();
  });

  afterEach(() => {
    UsageTracker.clear();
  });

  it("should track and record usage logs correctly", () => {
    UsageTracker.trackUsage("gemini", "gemini-2.5-flash", 100, 200, 0.0015, "session-1");
    const summary = UsageTracker.getTotalUsage();
    expect(summary.totalRecords).toBe(1);
    expect(summary.totalInputTokens).toBe(100);
    expect(summary.totalOutputTokens).toBe(200);
    expect(summary.totalCost).toBe(0.0015);
  });

  it("should aggregate usage by provider", () => {
    UsageTracker.trackUsage("gemini", "gemini-2.5-flash", 100, 200, 0.0015);
    UsageTracker.trackUsage("openai", "gpt-4o", 50, 100, 0.0030);
    UsageTracker.trackUsage("gemini", "gemini-2.5-pro", 150, 300, 0.0045);

    const byProvider = UsageTracker.getUsageByProvider();
    expect(byProvider.length).toBe(2);

    const geminiStats = byProvider.find(p => p.provider === "gemini");
    expect(geminiStats?.callCount).toBe(2);
    expect(geminiStats?.totalCost).toBe(0.006);

    const openaiStats = byProvider.find(p => p.provider === "openai");
    expect(openaiStats?.callCount).toBe(1);
    expect(openaiStats?.totalCost).toBe(0.003);
  });

  it("should aggregate daily usage properly", () => {
    const today = new Date().toISOString().split("T")[0];
    UsageTracker.trackUsage("gemini", "gemini-2.5-flash", 10, 10, 0.0001);
    UsageTracker.trackUsage("gemini", "gemini-2.5-flash", 20, 20, 0.0002);

    const daily = UsageTracker.getDailyUsage(1);
    expect(daily.length).toBe(1);
    expect(daily[0].date).toBe(today);
    expect(daily[0].totalCost).toBe(0.0003);
    expect(daily[0].callCount).toBe(2);
  });
});
