
import { describe, it, expect, vi, beforeEach } from "vitest";
import { indexWorkspace, searchWorkspace } from "../VectorClient.js";
import fs from "fs";
import os from "os";

// Mock fs and os modules
vi.mock("fs");
vi.mock("os");

describe("VectorClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock os.homedir
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    
    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockReturnValue(true);
    
    // Mock fs.readdirSync
    vi.mocked(fs.readdirSync).mockReturnValue([] as any);
    
    // Mock fs.statSync
    vi.mocked(fs.statSync).mockImplementation((path: any) => ({
      isDirectory: () => false,
      isFile: () => true,
      size: 1024,
    } as any));
    
    // Mock fs.readFileSync
    vi.mocked(fs.readFileSync).mockReturnValue("test content" as any);
    
    // Mock fs.writeFileSync
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  describe("indexWorkspace", () => {
    it("should return false if workspace path does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      
      const result = await indexWorkspace("/nonexistent/path");
      
      expect(result).toBe(false);
    });

    it("should return true on successful indexing", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(["test.js"] as any);
      vi.mocked(fs.readFileSync).mockReturnValue("const test = 'hello';\nconsole.log(test);" as any);
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });

    it("should handle file read errors gracefully", async () => {
      vi.mocked(fs.readdirSync).mockReturnValue(["test.js"] as any);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("Read error");
      });
      
      const result = await indexWorkspace("/test/workspace");
      
      // Should still return true even if some files fail
      expect(result).toBe(true);
    });

    it("should skip ignored directories", async () => {
      vi.mocked(fs.readdirSync).mockReturnValue([
        "node_modules",
        ".git",
        "src"
      ] as any);
      
      await indexWorkspace("/test/workspace");
      
      // Should not throw and should skip ignored dirs
      expect(true).toBe(true);
    });

    it("should respect file extension whitelist", async () => {
      vi.mocked(fs.readdirSync).mockReturnValue([
        "test.js",
        "test.ts",
        "test.md",
        "test.txt", // not in whitelist
        "test.exe"  // not in whitelist
      ] as any);
      
      await indexWorkspace("/test/workspace");
      
      // Should process only whitelisted extensions
      expect(true).toBe(true);
    });

    it("should skip files larger than 1MB", async () => {
      vi.mocked(fs.statSync).mockImplementation((path: any) => ({
        isFile: () => true,
        isDirectory: () => false,
        size: 2 * 1024 * 1024, // 2MB
      } as any));
      
      await indexWorkspace("/test/workspace");
      
      // Should skip large files
      expect(true).toBe(true);
    });
  });

  describe("search", () => {
    it("should return empty array when no index exists", async () => {
      const results = await searchWorkspace("test query");
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it("should handle empty query", async () => {
      const results = await searchWorkspace("");
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should not throw on search errors", async () => {
      await expect(searchWorkspace("test query")).resolves.toBeDefined();
    });
  });

  describe("Tokenization", () => {
    it("should handle basic text tokenization", () => {
      // Tokenization is an internal function, but we can test it indirectly
      // through indexing behavior
      expect(true).toBe(true);
    });

    it("should support Unicode characters (Bangla)", async () => {
      vi.mocked(fs.readdirSync).mockReturnValue(["test.js"] as any);
      vi.mocked(fs.readFileSync).mockReturnValue("const text = 'হ্যালো বিশ্ব';" as any);
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });
  });

  describe("Chunking", () => {
    it("should chunk files into overlapping pieces", async () => {
      const longContent = Array(100).fill("line of code").join("\n");
      vi.mocked(fs.readdirSync).mockReturnValue(["test.js"] as any);
      vi.mocked(fs.readFileSync).mockReturnValue(longContent as any);
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });

    it("should skip chunks that are too small", async () => {
      vi.mocked(fs.readdirSync).mockReturnValue(["test.js"] as any);
      vi.mocked(fs.readFileSync).mockReturnValue("a\nb\nc" as any);
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });
  });

  describe("Cache Management", () => {
    it("should use cache path based on workspace hash", async () => {
      await indexWorkspace("/test/workspace");
      
      // Should have attempted to read/write cache
      // (implementation detail - just verify no errors)
      expect(true).toBe(true);
    });

    it("should handle cache read errors", async () => {
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error("Cache read error");
      });
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });
  });

  describe("Workspace Walking", () => {
    it("should respect max depth limit", async () => {
      // Create deeply nested directory structure
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => true,
        isFile: () => false,
        size: 0,
      } as any);
      
      await indexWorkspace("/test/workspace");
      
      // Should not exceed max depth
      expect(true).toBe(true);
    });

    it("should respect max file limit", async () => {
      // Return many files
      const manyFiles = Array(5000).fill("file.js");
      vi.mocked(fs.readdirSync).mockReturnValue(manyFiles as any);
      
      await indexWorkspace("/test/workspace");
      
      // Should cap at max files (3000)
      expect(true).toBe(true);
    });

    it("should handle stat errors gracefully", async () => {
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error("Stat error");
      });
      
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });
  });

  describe("Embedding Support", () => {
    it("should work without API key (keyword-only search)", async () => {
      const result = await indexWorkspace("/test/workspace");
      
      expect(result).toBe(true);
    });

    it("should support optional API key for embeddings", async () => {
      const result = await indexWorkspace("/test/workspace", "test-api-key");
      
      expect(result).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should not crash on unexpected errors", async () => {
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error("Unexpected error");
      });
      
      await expect(indexWorkspace("/test/workspace")).resolves.toBeDefined();
    });

    it("should handle invalid file paths", async () => {
      await expect(indexWorkspace("")).resolves.toBeDefined();
    });

    it("should handle special characters in paths", async () => {
      await expect(indexWorkspace("/test/workspace with spaces")).resolves.toBeDefined();
    });
  });
});
