import { describe, it, expect } from "vitest";
import { Logger } from "./Logger.js";

describe("Logger", () => {
  describe("Exports", () => {
    it("should export Logger instance", () => {
      expect(Logger).toBeDefined();
    });

    it("should be an object (Logger instance)", () => {
      expect(typeof Logger).toBe("object");
    });

    it("should have log method", () => {
      expect(Logger).toHaveProperty("log");
      expect(typeof Logger.log).toBe("function");
    });

    it("should have info method", () => {
      expect(Logger).toHaveProperty("info");
      expect(typeof Logger.info).toBe("function");
    });

    it("should have warn method", () => {
      expect(Logger).toHaveProperty("warn");
      expect(typeof Logger.warn).toBe("function");
    });

    it("should have error method", () => {
      expect(Logger).toHaveProperty("error");
      expect(typeof Logger.error).toBe("function");
    });

    it("should have debug method", () => {
      expect(Logger).toHaveProperty("debug");
      expect(typeof Logger.debug).toBe("function");
    });
  });

  describe("Namespace Configuration", () => {
    it("should be configured with AgentCore namespace", () => {
      // Logger from shared-utils should have a namespace property
      expect(Logger).toHaveProperty("namespace");
      expect((Logger as any).namespace).toBe("AgentCore");
    });
  });

  describe("Basic Functionality", () => {
    it("should not throw when calling log methods", () => {
      expect(() => Logger.log("test message")).not.toThrow();
      expect(() => Logger.info("test info")).not.toThrow();
      expect(() => Logger.warn("test warning")).not.toThrow();
      expect(() => Logger.error("test error")).not.toThrow();
      expect(() => Logger.debug("test debug")).not.toThrow();
    });

    it("should handle multiple arguments", () => {
      expect(() => Logger.log("message", { data: "value" }, 123)).not.toThrow();
    });

    it("should handle empty calls", () => {
      expect(() => Logger.log()).not.toThrow();
    });

    it("should handle null and undefined", () => {
      expect(() => Logger.log(null)).not.toThrow();
      expect(() => Logger.log(undefined)).not.toThrow();
    });

    it("should handle objects and arrays", () => {
      expect(() => Logger.log({ key: "value" })).not.toThrow();
      expect(() => Logger.log([1, 2, 3])).not.toThrow();
    });

    it("should handle errors", () => {
      const error = new Error("Test error");
      expect(() => Logger.error(error)).not.toThrow();
    });
  });
});
