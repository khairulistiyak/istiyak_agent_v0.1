import { describe, it, expect } from "vitest";
import { calculateCost, resetSessionCost, getSessionCost } from "./CostTracker.js";

describe("CostTracker", () => {
  it("calculates cost for known model", () => {
    const cost = calculateCost("gemini", 1000, 500, "gemini-2.5-flash");
    expect(cost).toBeGreaterThan(0);
  });

  it("returns 0 for ollama", () => {
    const cost = calculateCost("ollama", 1000, 500);
    expect(cost).toBe(0);
  });

  it("accumulates session cost", () => {
    resetSessionCost();
    calculateCost("gemini", 1000, 500, "gemini-2.5-flash");
    calculateCost("gemini", 500, 200, "gemini-2.5-flash");
    const stats = getSessionCost();
    expect(stats.totalCost).toBeGreaterThan(0);
    expect(stats.callCount).toBe(2);
  });
});
