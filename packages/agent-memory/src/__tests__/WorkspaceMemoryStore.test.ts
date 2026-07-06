
import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspaceMemoryStore } from "../WorkspaceMemoryStore.js";
import { JsonFileStore } from "../SQLiteMemoryStore.js";

// Mock JsonFileStore
vi.mock("../SQLiteMemoryStore.js", () => ({
  JsonFileStore: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("WorkspaceMemoryStore", () => {
  let store: WorkspaceMemoryStore;
  let mockJsonStore: any;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new WorkspaceMemoryStore("/test/workspace");
    mockJsonStore = (store as any).store;
  });

  describe("Constructor", () => {
    it("should create WorkspaceMemoryStore with workspace path", () => {
      const newStore = new WorkspaceMemoryStore("/my/workspace");
      expect(newStore).toBeDefined();
    });

    it("should initialize JsonFileStore", () => {
      expect(JsonFileStore).toHaveBeenCalled();
    });

    it("should handle empty workspace path", () => {
      const newStore = new WorkspaceMemoryStore("");
      expect(newStore).toBeDefined();
    });

    it("should handle workspace path with special characters", () => {
      const newStore = new WorkspaceMemoryStore("/path/with spaces/and-dashes");
      expect(newStore).toBeDefined();
    });
  });

  describe("getRule", () => {
    it("should call store.get with prefixed key", async () => {
      mockJsonStore.get.mockResolvedValue("value");
      
      await store.getRule("testRule");
      
      expect(mockJsonStore.get).toHaveBeenCalledWith("/test/workspace:testRule");
    });

    it("should return value from store", async () => {
      mockJsonStore.get.mockResolvedValue("expectedValue");
      
      const result = await store.getRule("myRule");
      
      expect(result).toBe("expectedValue");
    });

    it("should handle undefined return value", async () => {
      mockJsonStore.get.mockResolvedValue(undefined);
      
      const result = await store.getRule("nonexistent");
      
      expect(result).toBeUndefined();
    });

    it("should handle object values", async () => {
      const objectValue = { nested: "data", count: 42 };
      mockJsonStore.get.mockResolvedValue(objectValue);
      
      const result = await store.getRule("objectRule");
      
      expect(result).toEqual(objectValue);
    });

    it("should handle array values", async () => {
      const arrayValue = [1, 2, 3, "four"];
      mockJsonStore.get.mockResolvedValue(arrayValue);
      
      const result = await store.getRule("arrayRule");
      
      expect(result).toEqual(arrayValue);
    });

    it("should handle null values", async () => {
      mockJsonStore.get.mockResolvedValue(null);
      
      const result = await store.getRule("nullRule");
      
      expect(result).toBeNull();
    });
  });

  describe("setRule", () => {
    it("should call store.set with prefixed key", async () => {
      await store.setRule("testRule", "testValue");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:testRule",
        "testValue"
      );
    });

    it("should store string values", async () => {
      await store.setRule("stringRule", "string value");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:stringRule",
        "string value"
      );
    });

    it("should store object values", async () => {
      const objectValue = { key: "value", nested: { data: true } };
      await store.setRule("objectRule", objectValue);
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:objectRule",
        objectValue
      );
    });

    it("should store array values", async () => {
      const arrayValue = [1, 2, 3];
      await store.setRule("arrayRule", arrayValue);
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:arrayRule",
        arrayValue
      );
    });

    it("should store null values", async () => {
      await store.setRule("nullRule", null);
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:nullRule",
        null
      );
    });

    it("should store undefined values", async () => {
      await store.setRule("undefinedRule", undefined);
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:undefinedRule",
        undefined
      );
    });

    it("should handle multiple setRule calls", async () => {
      await store.setRule("rule1", "value1");
      await store.setRule("rule2", "value2");
      await store.setRule("rule3", "value3");
      
      expect(mockJsonStore.set).toHaveBeenCalledTimes(3);
    });
  });

  describe("deleteRule", () => {
    it("should call store.delete with prefixed key", async () => {
      await store.deleteRule("testRule");
      
      expect(mockJsonStore.delete).toHaveBeenCalledWith(
        "/test/workspace:testRule"
      );
    });

    it("should handle deleting existing rule", async () => {
      await store.deleteRule("existingRule");
      
      expect(mockJsonStore.delete).toHaveBeenCalledWith(
        "/test/workspace:existingRule"
      );
    });

    it("should handle deleting non-existent rule", async () => {
      await store.deleteRule("nonExistentRule");
      
      expect(mockJsonStore.delete).toHaveBeenCalledWith(
        "/test/workspace:nonExistentRule"
      );
    });

    it("should handle multiple deleteRule calls", async () => {
      await store.deleteRule("rule1");
      await store.deleteRule("rule2");
      
      expect(mockJsonStore.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe("Workspace Isolation", () => {
    it("should prefix keys with workspace path", async () => {
      const store1 = new WorkspaceMemoryStore("/workspace1");
      const store2 = new WorkspaceMemoryStore("/workspace2");
      
      const mockStore1 = (store1 as any).store;
      const mockStore2 = (store2 as any).store;
      
      await store1.setRule("sameKey", "value1");
      await store2.setRule("sameKey", "value2");
      
      expect(mockStore1.set).toHaveBeenCalledWith("/workspace1:sameKey", "value1");
      expect(mockStore2.set).toHaveBeenCalledWith("/workspace2:sameKey", "value2");
    });

    it("should create unique keys for different workspaces", async () => {
      await store.setRule("rule", "value");
      
      const otherStore = new WorkspaceMemoryStore("/other/workspace");
      const otherMockStore = (otherStore as any).store;
      await otherStore.setRule("rule", "otherValue");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:rule",
        "value"
      );
      expect(otherMockStore.set).toHaveBeenCalledWith(
        "/other/workspace:rule",
        "otherValue"
      );
    });
  });

  describe("Integration Workflow", () => {
    it("should support set and get workflow", async () => {
      mockJsonStore.set.mockResolvedValue(undefined);
      mockJsonStore.get.mockResolvedValue("storedValue");
      
      await store.setRule("myRule", "storedValue");
      const result = await store.getRule("myRule");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:myRule",
        "storedValue"
      );
      expect(mockJsonStore.get).toHaveBeenCalledWith("/test/workspace:myRule");
      expect(result).toBe("storedValue");
    });

    it("should support set, get, delete workflow", async () => {
      mockJsonStore.set.mockResolvedValue(undefined);
      mockJsonStore.get.mockResolvedValueOnce("value").mockResolvedValueOnce(undefined);
      mockJsonStore.delete.mockResolvedValue(undefined);
      
      await store.setRule("tempRule", "value");
      const before = await store.getRule("tempRule");
      await store.deleteRule("tempRule");
      const after = await store.getRule("tempRule");
      
      expect(before).toBe("value");
      expect(after).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as rule key", async () => {
      await store.setRule("", "value");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith("/test/workspace:", "value");
    });

    it("should handle special characters in rule keys", async () => {
      await store.setRule("rule!@#$%", "value");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:rule!@#$%",
        "value"
      );
    });

    it("should handle very long rule keys", async () => {
      const longKey = "k".repeat(1000);
      await store.setRule(longKey, "value");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        `/test/workspace:${longKey}`,
        "value"
      );
    });

    it("should handle rule keys that contain colons", async () => {
      await store.setRule("key:with:colons", "value");
      
      expect(mockJsonStore.set).toHaveBeenCalledWith(
        "/test/workspace:key:with:colons",
        "value"
      );
    });

    it("should handle workspace paths with trailing slashes", async () => {
      const storeWithSlash = new WorkspaceMemoryStore("/workspace/");
      const mockStore = (storeWithSlash as any).store;
      
      await storeWithSlash.setRule("rule", "value");
      
      expect(mockStore.set).toHaveBeenCalledWith("/workspace/:rule", "value");
    });
  });
});
