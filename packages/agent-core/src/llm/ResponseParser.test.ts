import { describe, it, expect } from "vitest";
import { parseResponse } from "./ResponseParser.js";

describe("ResponseParser", () => {
  it("should parse clean JSON correctly", () => {
    const jsonStr = JSON.stringify({
      action: "run_command",
      params: { command: "npm test" },
      thought: "Testing application"
    });
    const result = parseResponse(jsonStr);
    expect(result.action).toBe("run_command");
    expect(result.params?.command).toBe("npm test");
  });

  it("should parse JSON wrapped in markdown code blocks", () => {
    const input = "Here is my response:\n```json\n{\n  \"action\": \"write_file\",\n  \"params\": { \"relPath\": \"file.txt\", \"content\": \"hello\" },\n  \"thought\": \"writing\"\n}\n```\nHope this helps!";
    const result = parseResponse(input);
    expect(result.action).toBe("write_file");
    expect(result.params?.relPath).toBe("file.txt");
  });

  it("should extract JSON with leading and trailing text using depth search", () => {
    const input = "Sure! {\"action\":\"done\",\"params\":{\"summary\":\"hello\"}} is my choice.";
    const result = parseResponse(input);
    expect(result.action).toBe("done");
    expect(result.params?.summary).toBe("hello");
  });

  it("should handle JSON with trailing commas", () => {
    const input = "{\n  \"action\": \"done\",\n  \"params\": {\n    \"summary\": \"hello\",\n  },\n}";
    const result = parseResponse(input);
    expect(result.action).toBe("done");
    expect(result.params?.summary).toBe("hello");
  });

  it("should throw error for invalid JSON containing no action field", () => {
    const input = "This is a random sentence with no JSON.";
    expect(() => parseResponse(input)).toThrowError(/Failed to extract valid JSON/);
  });
});
