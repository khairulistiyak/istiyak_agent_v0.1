import { describe, it, expect } from "vitest";
import { MODELS, getModelsForProvider, getModelInfo } from "./Models.js";

describe("Models", () => {
  it("should retrieve models for a valid provider", () => {
    const geminiModels = getModelsForProvider("gemini");
    expect(geminiModels).toContain("gemini-2.5-flash");
    expect(geminiModels).toContain("gemini-2.5-pro");
  });

  it("should return empty list for invalid provider", () => {
    const invalidModels = getModelsForProvider("unknown_provider");
    expect(invalidModels).toEqual([]);
  });

  it("should get model details for valid modelId", () => {
    const model = getModelInfo("gemini-2.5-flash");
    expect(model).toBeDefined();
    expect(model?.displayName).toBe("Gemini 2.5 Flash");
    expect(model?.provider).toBe("gemini");
  });

  it("should return undefined for unknown modelId", () => {
    const model = getModelInfo("nonexistent-model");
    expect(model).toBeUndefined();
  });
});
