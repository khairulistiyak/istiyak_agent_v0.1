import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class ListFilesTool extends BaseTool {
  name = "list_files";
  description = "Lists files in the immediate target directory.";
  parameterSchema = {
    type: "object",
    properties: {
      relPath: { type: "string" }
    }
  };

  async execute(params: { relPath?: string }, context: ToolContext): Promise<string> {
    const targetDir = params.relPath ? path.resolve(context.workspacePath, params.relPath) : context.workspacePath;
    if (!targetDir.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }
    const list = await fs.readdir(targetDir);
    return `Directory listing (${list.length} items):\n${list.join("\n")}`;
  }
}
