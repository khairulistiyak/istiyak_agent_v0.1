import { describe, it, expect } from "vitest";
import { sha256, encrypt, decrypt } from "./crypto.js";

describe("crypto utilities", () => {
  describe("sha256", () => {
    it("should hash a simple string", () => {
      const hash = sha256("hello");
      expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    });

    it("should hash an empty string", () => {
      const hash = sha256("");
      expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    });

    it("should hash special characters", () => {
      const hash = sha256("!@#$%^&*()");
      expect(hash).toHaveLength(64); // SHA256 always produces 64 hex chars
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = sha256("hello");
      const hash2 = sha256("world");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce same hash for same input (deterministic)", () => {
      const hash1 = sha256("test");
      const hash2 = sha256("test");
      expect(hash1).toBe(hash2);
    });
  });

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a simple string", () => {
      const plaintext = "hello world";
      const secretKey = "my-secret-key";
      const encrypted = encrypt(plaintext, secretKey);
      const decrypted = decrypt(encrypted, secretKey);
      expect(decrypted).toBe(plaintext);
    });

    it("should produce different ciphertext for same input (random IV)", () => {
      const plaintext = "hello";
      const secretKey = "key";
      const encrypted1 = encrypt(plaintext, secretKey);
      const encrypted2 = encrypt(plaintext, secretKey);
      expect(encrypted1).not.toBe(encrypted2); // Different IV each time
      expect(decrypt(encrypted1, secretKey)).toBe(plaintext);
      expect(decrypt(encrypted2, secretKey)).toBe(plaintext);
    });

    it("should fail to decrypt with wrong key", () => {
      const plaintext = "secret message";
      const correctKey = "correct-key";
      const wrongKey = "wrong-key";
      const encrypted = encrypt(plaintext, correctKey);
      expect(() => decrypt(encrypted, wrongKey)).toThrow();
    });

    it("should handle empty string", () => {
      const plaintext = "";
      const secretKey = "key";
      const encrypted = encrypt(plaintext, secretKey);
      const decrypted = decrypt(encrypted, secretKey);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle special characters", () => {
      const plaintext = "Hello 世界! 🚀 @#$%";
      const secretKey = "unicode-key";
      const encrypted = encrypt(plaintext, secretKey);
      const decrypted = decrypt(encrypted, secretKey);
      expect(decrypted).toBe(plaintext);
    });

    it("should handle long text", () => {
      const plaintext = "a".repeat(10000);
      const secretKey = "long-key";
      const encrypted = encrypt(plaintext, secretKey);
      const decrypted = decrypt(encrypted, secretKey);
      expect(decrypted).toBe(plaintext);
    });

    it("should return empty string for invalid encrypted format", () => {
      const invalidHash = "not-a-valid-hash";
      const secretKey = "key";
      const result = decrypt(invalidHash, secretKey);
      expect(result).toBe("");
    });
  });
});
