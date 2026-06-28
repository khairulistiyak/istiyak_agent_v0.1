import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class CreateDirectoryTool extends BaseTool {
  name = "create_directory";
  description = "Creates a directory hierarchy inside the workspace.";
  parameterSchema = {
    type: "object",
    required: ["relPath"],
    properties: {
      relPath: { type: "string" }
    }
  };

  async execute(params: { relPath: string }, context: ToolContext): Promise<string> {
    const cwd = path.resolve(context.workspacePath);
    const target = path.resolve(cwd, params.relPath);

    if (!target.startsWith(cwd)) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    await fs.mkdir(target, { recursive: true });
    return `Successfully created directory: ${params.relPath}`;
  }
}
