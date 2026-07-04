import { describe, it, expect } from "vitest";
import { maskSecrets } from "./mask.js";

describe("maskSecrets", () => {
  it("should mask a single secret", () => {
    const text = "My API key is sk-1234567890";
    const secrets = ["sk-1234567890"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("My API key is ******");
  });

  it("should mask multiple secrets", () => {
    const text = "API key: abc123 and password: pass456";
    const secrets = ["abc123", "pass456"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("API key: ****** and password: ******");
  });

  it("should handle secrets appearing multiple times", () => {
    const text = "secret: mykey, again: mykey";
    const secrets = ["mykey"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("secret: ******, again: ******");
  });

  it("should not mask secrets shorter than 5 characters", () => {
    const text = "short key: test";
    const secrets = ["test"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("short key: test"); // Not masked because length <= 4
  });

  it("should handle empty secrets array", () => {
    const text = "no secrets here";
    const secrets: string[] = [];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("no secrets here");
  });

  it("should handle empty string secrets", () => {
    const text = "some text";
    const secrets = ["", "valid"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("some text"); // Empty string ignored
  });

  it("should handle special regex characters in secrets", () => {
    const text = "Secret: $100.00 or [test]";
    const secrets = ["$100.00", "[test]"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("Secret: ****** or ******");
  });

  it("should handle secrets with parentheses and other special chars", () => {
    const text = "Password: (secret123) and {key456}";
    const secrets = ["(secret123)", "{key456}"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("Password: ****** and ******");
  });

  it("should not mask partial matches", () => {
    const text = "testing123 and test456";
    const secrets = ["test"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("testing123 and test456"); // "test" is too short (4 chars)
  });

  it("should handle Unicode characters", () => {
    const text = "Secret: 世界123";
    const secrets = ["世界123"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("Secret: ******");
  });

  it("should handle long secrets", () => {
    const longSecret = "a".repeat(100);
    const text = `Secret: ${longSecret}`;
    const secrets = [longSecret];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("Secret: ******");
  });

  it("should handle overlapping secrets", () => {
    const text = "Secret: abcdef";
    const secrets = ["abcdef", "abc"];
    const masked = maskSecrets(text, secrets);
    expect(masked).toBe("Secret: ******"); // First match wins
  });
});
