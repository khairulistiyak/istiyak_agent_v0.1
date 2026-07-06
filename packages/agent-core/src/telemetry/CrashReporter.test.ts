import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CrashReporter } from "./CrashReporter.js";
import fs from "fs";
import os from "os";
import path from "path";

// Mock fs and os modules
vi.mock("fs");
vi.mock("os");
vi.mock("path");

describe("CrashReporter", () => {
  const mockCrashDir = "/home/user/.istiyak_crash_logs";
  let mockFiles: Map<string, string>;

  beforeEach(() => {
    mockFiles = new Map();
    
    // Mock os.homedir
    vi.mocked(os.homedir).mockReturnValue("/home/user");
    
    // Mock path.join to return predictable paths
    vi.mocked(path.join).mockImplementation((...args) => args.join("/"));
    
    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockImplementation((filePath: any) => {
      return mockFiles.has(filePath.toString()) || filePath === mockCrashDir;
    });
    
    // Mock fs.mkdirSync (no-op)
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
    
    // Mock fs.writeFileSync
    vi.mocked(fs.writeFileSync).mockImplementation((filePath: any, content: any) => {
      mockFiles.set(filePath.toString(), content.toString());
    });
    
    // Mock fs.readFileSync
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      const content = mockFiles.get(filePath.toString());
      if (!content) throw new Error("File not found");
      return content;
    });
    
    // Mock fs.readdirSync
    vi.mocked(fs.readdirSync).mockImplementation((dirPath: any) => {
      if (dirPath !== mockCrashDir) return [];
      return Array.from(mockFiles.keys())
        .filter(k => k.startsWith(mockCrashDir))
        .map(k => k.split("/").pop()!)
        .filter(Boolean) as any;
    });
    
    // Mock fs.unlinkSync
    vi.mocked(fs.unlinkSync).mockImplementation((filePath: any) => {
      mockFiles.delete(filePath.toString());
    });
    
    // Mock console.error to suppress error output during tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockFiles.clear();
  });

  describe("reportCrash", () => {
    it("should generate unique crash ID", () => {
      const error = new Error("Test error");
      const crashId1 = CrashReporter.reportCrash(error);
      const crashId2 = CrashReporter.reportCrash(error);
      
      expect(crashId1).toMatch(/^crash-\d+-[a-z0-9]+$/);
      expect(crashId2).toMatch(/^crash-\d+-[a-z0-9]+$/);
      expect(crashId1).not.toBe(crashId2);
    });

    it("should persist crash report to disk", () => {
      const error = new Error("Test error");
      const crashId = CrashReporter.reportCrash(error);
      
      expect(fs.writeFileSync).toHaveBeenCalled();
      
      const expectedPath = `${mockCrashDir}/${crashId}.json`;
      expect(mockFiles.has(expectedPath)).toBe(true);
    });

    it("should include error details in report", () => {
      const error = new Error("Test error");
      error.name = "CustomError";
      error.stack = "Error: Test error\n    at testFunc (/path/to/file.js:10:5)";
      
      const crashId = CrashReporter.reportCrash(error);
      const reportPath = `${mockCrashDir}/${crashId}.json`;
      const report = JSON.parse(mockFiles.get(reportPath)!);
      
      expect(report.error.name).toBe("CustomError");
      expect(report.error.message).toBe("Test error");
      expect(report.error.stack).toContain("testFunc");
    });

    it("should include custom context in report", () => {
      const error = new Error("Test error");
      const context = { userId: "123", action: "save_file" };
      
      const crashId = CrashReporter.reportCrash(error, context);
      const reportPath = `${mockCrashDir}/${crashId}.json`;
      const report = JSON.parse(mockFiles.get(reportPath)!);
      
      expect(report.context).toEqual(context);
    });

    it("should include system information", () => {
      const error = new Error("Test error");
      const crashId = CrashReporter.reportCrash(error);
      const reportPath = `${mockCrashDir}/${crashId}.json`;
      const report = JSON.parse(mockFiles.get(reportPath)!);
      
      expect(report.system).toBeDefined();
      expect(report.system.platform).toBeDefined();
      expect(report.system.arch).toBeDefined();
      expect(report.system.nodeVersion).toBeDefined();
      expect(report.system.memoryUsage).toBeDefined();
      expect(report.system.uptime).toBeDefined();
    });

    it("should include parsed stack trace", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test\n    at testFunc (/path/to/file.js:10:5)";
      
      const crashId = CrashReporter.reportCrash(error);
      const reportPath = `${mockCrashDir}/${crashId}.json`;
      const report = JSON.parse(mockFiles.get(reportPath)!);
      
      expect(report.parsedStack).toBeDefined();
      expect(Array.isArray(report.parsedStack)).toBe(true);
    });

    it("should handle errors without stack traces", () => {
      const error = new Error("Test error");
      error.stack = undefined;
      
      const crashId = CrashReporter.reportCrash(error);
      const reportPath = `${mockCrashDir}/${crashId}.json`;
      const report = JSON.parse(mockFiles.get(reportPath)!);
      
      expect(report.error.stack).toBe("");
      expect(report.parsedStack).toEqual([]);
    });

    it("should handle file write errors gracefully", () => {
      vi.mocked(fs.writeFileSync).mockImplementationOnce(() => {
        throw new Error("Write error");
      });
      
      const error = new Error("Test error");
      const crashId = CrashReporter.reportCrash(error);
      
      // Should still return crash ID even if write fails
      expect(crashId).toMatch(/^crash-\d+-[a-z0-9]+$/);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to write crash log")
      );
    });

    it("should log error to console", () => {
      const error = new Error("Test error");
      const crashId = CrashReporter.reportCrash(error);
      
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining(crashId)
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Test error")
      );
    });
  });

  describe("getRecentCrashes", () => {
    it("should return empty array when no crashes", () => {
      const crashes = CrashReporter.getRecentCrashes();
      expect(crashes).toEqual([]);
    });

    it("should return most recent crashes", () => {
      // Create multiple crash reports
      const crashIds: string[] = [];
      for (let i = 0; i < 5; i++) {
        const error = new Error(`Error ${i}`);
        const crashId = CrashReporter.reportCrash(error);
        crashIds.push(crashId);
      }
      
      const crashes = CrashReporter.getRecentCrashes(3);
      expect(crashes.length).toBe(3);
    });

    it("should return crashes in reverse chronological order", () => {
      const crashId1 = CrashReporter.reportCrash(new Error("First"));
      const crashId2 = CrashReporter.reportCrash(new Error("Second"));
      
      const crashes = CrashReporter.getRecentCrashes(2);
      
      // Most recent should be first
      expect(crashes[0].id).toBe(crashId2);
      expect(crashes[1].id).toBe(crashId1);
    });

    it("should respect count parameter", () => {
      for (let i = 0; i < 10; i++) {
        CrashReporter.reportCrash(new Error(`Error ${i}`));
      }
      
      expect(CrashReporter.getRecentCrashes(5).length).toBe(5);
      expect(CrashReporter.getRecentCrashes(10).length).toBe(10);
    });

    it("should default to 10 crashes when no count provided", () => {
      for (let i = 0; i < 15; i++) {
        CrashReporter.reportCrash(new Error(`Error ${i}`));
      }
      
      const crashes = CrashReporter.getRecentCrashes();
      expect(crashes.length).toBe(10);
    });

    it("should filter out corrupted JSON files", () => {
      // Create one valid crash
      CrashReporter.reportCrash(new Error("Valid"));
      
      // Add a corrupted file directly
      mockFiles.set(`${mockCrashDir}/corrupted.json`, "invalid json{{{");
      
      const crashes = CrashReporter.getRecentCrashes();
      expect(crashes.length).toBe(1);
      expect(crashes[0].error.message).toBe("Valid");
    });

    it("should return empty array on directory read error", () => {
      vi.mocked(fs.readdirSync).mockImplementationOnce(() => {
        throw new Error("Read error");
      });
      
      const crashes = CrashReporter.getRecentCrashes();
      expect(crashes).toEqual([]);
    });
  });

  describe("getCrash", () => {
    it("should retrieve specific crash by ID", () => {
      const error = new Error("Specific error");
      const crashId = CrashReporter.reportCrash(error, { test: "data" });
      
      const crash = CrashReporter.getCrash(crashId);
      
      expect(crash).toBeDefined();
      expect(crash.id).toBe(crashId);
      expect(crash.error.message).toBe("Specific error");
      expect(crash.context.test).toBe("data");
    });

    it("should return null for non-existent crash ID", () => {
      const crash = CrashReporter.getCrash("non-existent-id");
      expect(crash).toBeNull();
    });

    it("should return null on file read error", () => {
      vi.mocked(fs.readFileSync).mockImplementationOnce(() => {
        throw new Error("Read error");
      });
      
      const crash = CrashReporter.getCrash("some-id");
      expect(crash).toBeNull();
    });

    it("should return null for corrupted crash file", () => {
      const corruptedPath = `${mockCrashDir}/corrupted-crash.json`;
      mockFiles.set(corruptedPath, "invalid json{{{");
      
      const crash = CrashReporter.getCrash("corrupted-crash");
      expect(crash).toBeNull();
    });
  });

  describe("clearCrashLogs", () => {
    it("should delete all crash log files", () => {
      // Create multiple crashes
      for (let i = 0; i < 5; i++) {
        CrashReporter.reportCrash(new Error(`Error ${i}`));
      }
      
      expect(mockFiles.size).toBeGreaterThan(0);
      
      CrashReporter.clearCrashLogs();
      
      expect(mockFiles.size).toBe(0);
    });

    it("should handle errors during cleanup gracefully", () => {
      vi.mocked(fs.unlinkSync).mockImplementationOnce(() => {
        throw new Error("Delete error");
      });
      
      CrashReporter.reportCrash(new Error("Test"));
      
      // Should not throw
      expect(() => CrashReporter.clearCrashLogs()).not.toThrow();
    });

    it("should handle missing directory gracefully", () => {
      vi.mocked(fs.readdirSync).mockImplementationOnce(() => {
        throw new Error("Directory not found");
      });
      
      // Should not throw
      expect(() => CrashReporter.clearCrashLogs()).not.toThrow();
    });
  });

  describe("Stack Trace Parsing", () => {
    it("should parse standard stack trace format", () => {
      const error = new Error("Test");
      error.stack = `Error: Test
    at testFunction (/home/user/project/file.js:42:15)
    at anotherFunction (/home/user/project/other.js:100:8)`;
      
      const crashId = CrashReporter.reportCrash(error);
      const crash = CrashReporter.getCrash(crashId);
      
      expect(crash.parsedStack).toHaveLength(2);
      expect(crash.parsedStack[0].function).toBe("testFunction");
      expect(crash.parsedStack[0].file).toBe("/home/user/project/file.js");
      expect(crash.parsedStack[0].line).toBe(42);
      expect(crash.parsedStack[0].column).toBe(15);
    });

    it("should parse anonymous function format", () => {
      const error = new Error("Test");
      error.stack = `Error: Test
    at /home/user/project/anonymous.js:10:5`;
      
      const crashId = CrashReporter.reportCrash(error);
      const crash = CrashReporter.getCrash(crashId);
      
      expect(crash.parsedStack).toHaveLength(1);
      expect(crash.parsedStack[0].function).toBe("<anonymous>");
      expect(crash.parsedStack[0].file).toBe("/home/user/project/anonymous.js");
      expect(crash.parsedStack[0].line).toBe(10);
      expect(crash.parsedStack[0].column).toBe(5);
    });

    it("should handle malformed stack trace lines", () => {
      const error = new Error("Test");
      error.stack = `Error: Test
    at someWeirdFormat
    at normalFunction (/path/to/file.js:1:1)`;
      
      const crashId = CrashReporter.reportCrash(error);
      const crash = CrashReporter.getCrash(crashId);
      
      // Should parse the normal line and handle the weird one
      expect(crash.parsedStack.length).toBeGreaterThan(0);
    });
  });

  describe("Crash Log Pruning", () => {
    it("should keep logs under MAX_CRASH_LOGS limit", () => {
      // Report more than MAX_CRASH_LOGS (50) crashes
      for (let i = 0; i < 55; i++) {
        CrashReporter.reportCrash(new Error(`Error ${i}`));
      }
      
      // Should have pruned to 50
      const allFiles = Array.from(mockFiles.keys());
      const crashFiles = allFiles.filter(f => f.includes(".json"));
      expect(crashFiles.length).toBeLessThanOrEqual(50);
    });

    it("should remove oldest crashes first when pruning", () => {
      // Create crashes with predictable IDs based on timestamp
      const crashIds: string[] = [];
      for (let i = 0; i < 52; i++) {
        const error = new Error(`Error ${i}`);
        const crashId = CrashReporter.reportCrash(error);
        crashIds.push(crashId);
      }
      
      // The first 2 crashes should have been pruned
      const firstCrash = CrashReporter.getCrash(crashIds[0]);
      const secondCrash = CrashReporter.getCrash(crashIds[1]);
      const lastCrash = CrashReporter.getCrash(crashIds[51]);
      
      expect(firstCrash).toBeNull();
      expect(secondCrash).toBeNull();
      expect(lastCrash).toBeDefined();
    });
  });
});
