import { describe, it, expect } from "vitest";
import { SecretMasker } from "./SecretMasker.js";

describe("SecretMasker", () => {
  it("masks OpenAI key (sk-*)", () => {
    const text = "key is sk-1234567890abcdefghij1234567890abcdefghij1234";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("sk-1234567890abcdefghij1234567890abcdefghij1234");
    expect(masked).toContain("sk-1");  // first 4 kept
    expect(masked).toContain("1234");  // last 4 kept
  });

  it("masks Google key (AIza*)", () => {
    const text = "AIzaSyABCDEF1234567890abcdef_GHIJ123456";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("AIzaSyABCDEF1234567890abcdef_GHIJ123456");
    expect(masked).toContain("AIza");  // first 4 kept
  });

  it("masks Anthropic key (sk-ant-*)", () => {
    const text = "sk-ant-ABCDEF1234567890abcdef_GHIJ1234567";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("sk-ant-ABCDEF1234567890abcdef_GHIJ1234567");
    expect(masked).toContain("sk-a");  // first 4 kept
  });

  it("masks GitHub token (ghp_*)", () => {
    const text = "ghp_1234567890abcdefghij1234567890abcdef";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("ghp_1234567890abcdefghij1234567890abcdef");
    expect(masked).toContain("ghp_");  // first 4 kept
  });

  it("masks environment variable assignments", () => {
    const text = "API_KEY=mysecretvalue";
    const masked = SecretMasker.mask(text);
    expect(masked).toBe("API_KEY=********");
  });

  it("handles text with no secrets", () => {
    const text = "Hello world, no secrets here.";
    const masked = SecretMasker.mask(text);
    expect(masked).toBe(text);
  });

  it("handles empty string", () => {
    expect(SecretMasker.mask("")).toBe("");
  });

  it("detects if text contains secrets", () => {
    expect(SecretMasker.containsSecrets("hello sk-1234567890abcdefghij1234567890abcdefghij1234")).toBe(true);
    expect(SecretMasker.containsSecrets("hello normal text")).toBe(false);
  });

  it("finds secret locations in text", () => {
    const text = "my key is ghp_1234567890abcdefghij1234567890abcdef";
    const locations = SecretMasker.findSecrets(text);
    expect(locations.length).toBe(1);
    expect(locations[0].type).toBe("GitHub Token");
  });
});
