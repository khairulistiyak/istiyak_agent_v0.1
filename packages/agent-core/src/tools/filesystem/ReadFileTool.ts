import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class ReadFileTool extends BaseTool {
  name = "read_file";
  description = "Reads the content of a target file.";
  parameterSchema = {
    type: "object",
    required: ["relPath"],
    properties: {
      relPath: { type: "string" }
    }
  };

  async execute(params: { relPath: string }, context: ToolContext): Promise<string> {
    const fullPath = path.resolve(context.workspacePath, params.relPath);
    if (!fullPath.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }
    return await fs.readFile(fullPath, "utf-8");
  }
}
