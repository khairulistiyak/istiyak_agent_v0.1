import { describe, it, expect } from "vitest";
import { TaskClassifier } from "./TaskClassifier.js";

describe("TaskClassifier", () => {
  describe("classify", () => {
    it("should classify short task with quick keywords as quick", () => {
      const task = "fix typo in index.ts";
      expect(TaskClassifier.classify(task)).toBe("quick");
    });

    it("should classify task with complex keywords as complex", () => {
      const task = "refactor auth logic and create new schema";
      expect(TaskClassifier.classify(task)).toBe("complex");
    });

    it("should classify long tasks (over 200 chars) as complex", () => {
      const task = "This is a very long task description that details the steps needed to write a new feature. " +
        "We need to first check if the database is running, then we need to write the schema, " +
        "then we should configure the routes and finally add tests to make sure it works fine.";
      expect(TaskClassifier.classify(task)).toBe("complex");
    });

    it("should classify multiple sentences as complex", () => {
      const task = "Check routes. Modify backend. Add tests.";
      expect(TaskClassifier.classify(task)).toBe("complex");
    });

    it("should default to quick for short simple tasks with no indicators", () => {
      const task = "Hello world simple task";
      expect(TaskClassifier.classify(task)).toBe("quick");
    });
  });
});
