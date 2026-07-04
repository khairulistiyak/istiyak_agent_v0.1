import { describe, it, expect } from "vitest";
import { PROVIDERS, PROVIDER_INFO, getProviderInfo, getCloudProviders, getLocalProviders } from "./Providers.js";

describe("Providers", () => {
  it("should return provider details by id", () => {
    const info = getProviderInfo("openai");
    expect(info).toBeDefined();
    expect(info?.displayName).toBe("OpenAI");
    expect(info?.requiresApiKey).toBe(true);
    expect(info?.isLocal).toBe(false);
  });

  it("should get cloud providers excluding local ones", () => {
    const clouds = getCloudProviders();
    expect(clouds.some(p => p.id === "ollama")).toBe(false);
    expect(clouds.some(p => p.id === "openai")).toBe(true);
  });

  it("should get local providers excluding cloud ones", () => {
    const locals = getLocalProviders();
    expect(locals.every(p => p.isLocal)).toBe(true);
    expect(locals.some(p => p.id === "ollama")).toBe(true);
  });
});
