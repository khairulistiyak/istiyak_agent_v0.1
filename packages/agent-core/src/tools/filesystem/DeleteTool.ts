import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class DeleteTool extends BaseTool {
  name = "delete_file";
  description = "Deletes a specific file or directory in the workspace.";
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

    await fs.rm(target, { recursive: true, force: true });
    return `Successfully deleted: ${params.relPath}`;
  }
}
