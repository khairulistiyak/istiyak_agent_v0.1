
import { describe, it, expect, vi, beforeEach } from "vitest";
import { JsonFileStore } from "../SQLiteMemoryStore.js";
import fs from "fs";
import os from "os";

// Mock fs and os modules
vi.mock("fs");
vi.mock("os");

describe("JsonFileStore (SQLiteMemoryStore)", () => {
  let store: JsonFileStore;
  let mockData: Record<string, any>;

  beforeEach(() => {
    mockData = {};

    // Mock os.homedir
    vi.mocked(os.homedir).mockReturnValue("/home/user");

    // Mock fs.existsSync
    vi.mocked(fs.existsSync).mockReturnValue(true);

    // Mock fs.readFileSync
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      return JSON.stringify(mockData);
    });

    // Mock fs.writeFileSync
    vi.mocked(fs.writeFileSync).mockImplementation((path, content) => {
      mockData = JSON.parse(content as string);
    });

    // Clear console.error mock
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("Constructor and Load", () => {
    it("should create store and load existing data", () => {
      mockData = { key1: "value1", key2: "value2" };
      store = new JsonFileStore();

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it("should handle missing file gracefully", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      store = new JsonFileStore();

      expect(() => new JsonFileStore()).not.toThrow();
    });

    it("should handle corrupted JSON file", () => {
      vi.mocked(fs.readFileSync).mockReturnValue("invalid json{{{" as any);
      store = new JsonFileStore();

      expect(() => new JsonFileStore()).not.toThrow();
    });

    it("should use correct file path", () => {
      store = new JsonFileStore();

      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/home/user/.istiyak_json_store.json",
        "utf-8"
      );
    });
  });

  describe("get", () => {
    it("should retrieve stored value", async () => {
      mockData = { testKey: "testValue" };
      store = new JsonFileStore();

      const value = await store.get("testKey");
      expect(value).toBe("testValue");
    });

    it("should return undefined for non-existent key", async () => {
      store = new JsonFileStore();

      const value = await store.get("nonExistentKey");
      expect(value).toBeUndefined();
    });

    it("should handle objects as values", async () => {
      mockData = { key: { nested: "value" } };
      store = new JsonFileStore();

      const value = await store.get("key");
      expect(value).toEqual({ nested: "value" });
    });

    it("should handle arrays as values", async () => {
      mockData = { key: [1, 2, 3] };
      store = new JsonFileStore();

      const value = await store.get("key");
      expect(value).toEqual([1, 2, 3]);
    });

    it("should handle null as value", async () => {
      mockData = { key: null };
      store = new JsonFileStore();

      const value = await store.get("key");
      expect(value).toBeNull();
    });
  });

  describe("set", () => {
    it("should store value and save to disk", async () => {
      store = new JsonFileStore();

      await store.set("newKey", "newValue");

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockData.newKey).toBe("newValue");
    });

    it("should overwrite existing value", async () => {
      mockData = { key: "oldValue" };
      store = new JsonFileStore();

      await store.set("key", "newValue");

      expect(mockData.key).toBe("newValue");
    });

    it("should handle object values", async () => {
      store = new JsonFileStore();

      await store.set("key", { nested: "object" });

      expect(mockData.key).toEqual({ nested: "object" });
    });

    it("should handle array values", async () => {
      store = new JsonFileStore();

      await store.set("key", [1, 2, 3]);

      expect(mockData.key).toEqual([1, 2, 3]);
    });

    it("should persist multiple keys", async () => {
      store = new JsonFileStore();

      await store.set("key1", "value1");
      await store.set("key2", "value2");
      await store.set("key3", "value3");

      expect(mockData).toEqual({
        key1: "value1",
        key2: "value2",
        key3: "value3",
      });
    });

    it("should save data in formatted JSON", async () => {
      store = new JsonFileStore();
      await store.set("key", "value");

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("  "), // Should have indentation
        "utf-8"
      );
    });

    it("should handle save errors gracefully", async () => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error("Write error");
      });

      store = new JsonFileStore();
      await store.set("key", "value");

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should remove key and save to disk", async () => {
      mockData = { key1: "value1", key2: "value2" };
      store = new JsonFileStore();

      await store.delete("key1");

      expect(mockData.key1).toBeUndefined();
      expect(mockData.key2).toBe("value2");
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("should handle deleting non-existent key", async () => {
      store = new JsonFileStore();

      await expect(store.delete("nonExistent")).resolves.not.toThrow();
    });

    it("should persist changes after delete", async () => {
      mockData = { key1: "value1", key2: "value2" };
      store = new JsonFileStore();

      await store.delete("key1");

      expect(Object.keys(mockData)).not.toContain("key1");
      expect(Object.keys(mockData)).toContain("key2");
    });

    it("should handle save errors gracefully", async () => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error("Write error");
      });

      mockData = { key: "value" };
      store = new JsonFileStore();
      await store.delete("key");

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("Integration", () => {
    it("should support get after set", async () => {
      store = new JsonFileStore();

      await store.set("testKey", "testValue");
      const value = await store.get("testKey");

      expect(value).toBe("testValue");
    });

    it("should support set, get, delete workflow", async () => {
      store = new JsonFileStore();

      await store.set("key", "value");
      expect(await store.get("key")).toBe("value");

      await store.delete("key");
      expect(await store.get("key")).toBeUndefined();
    });

    it("should maintain multiple keys independently", async () => {
      store = new JsonFileStore();

      await store.set("key1", "value1");
      await store.set("key2", "value2");

      expect(await store.get("key1")).toBe("value1");
      expect(await store.get("key2")).toBe("value2");

      await store.delete("key1");

      expect(await store.get("key1")).toBeUndefined();
      expect(await store.get("key2")).toBe("value2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as key", async () => {
      store = new JsonFileStore();
      await store.set("", "value");
      expect(await store.get("")).toBe("value");
    });

    it("should handle special characters in keys", async () => {
      store = new JsonFileStore();
      const specialKey = "key!@#$%^&*()";
      await store.set(specialKey, "value");
      expect(await store.get(specialKey)).toBe("value");
    });

    it("should handle very long keys", async () => {
      store = new JsonFileStore();
      const longKey = "k".repeat(1000);
      await store.set(longKey, "value");
      expect(await store.get(longKey)).toBe("value");
    });

    it("should handle very large values", async () => {
      store = new JsonFileStore();
      const largeValue = "v".repeat(100000);
      await store.set("key", largeValue);
      expect(await store.get("key")).toBe(largeValue);
    });

    it("should handle undefined as value", async () => {
      store = new JsonFileStore();
      await store.set("key", undefined);
      expect(await store.get("key")).toBeUndefined();
    });
  });
});
