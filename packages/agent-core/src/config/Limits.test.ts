import { describe, it, expect } from "vitest";
import { LIMITS } from "./Limits.js";

describe("LIMITS", () => {
  it("has sane MAX_STEPS", () => {
    expect(LIMITS.MAX_STEPS).toBeGreaterThan(0);
    expect(LIMITS.MAX_STEPS).toBeLessThanOrEqual(60);
  });

  it("has sane MAX_HISTORY_TOKENS", () => {
    expect(LIMITS.MAX_HISTORY_TOKENS).toBeGreaterThan(1000);
    expect(LIMITS.MAX_HISTORY_TOKENS).toBeLessThanOrEqual(200000);
  });
});
