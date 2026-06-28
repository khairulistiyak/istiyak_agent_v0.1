import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class RenameTool extends BaseTool {
  name = "rename_file";
  description = "Renames an existing file or directory.";
  parameterSchema = {
    type: "object",
    required: ["oldPath", "newPath"],
    properties: {
      oldPath: { type: "string" },
      newPath: { type: "string" }
    }
  };

  async execute(params: { oldPath: string; newPath: string }, context: ToolContext): Promise<string> {
    const cwd = path.resolve(context.workspacePath);
    const src = path.resolve(cwd, params.oldPath);
    const dest = path.resolve(cwd, params.newPath);

    if (!src.startsWith(cwd) || !dest.startsWith(cwd)) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    await fs.rename(src, dest);
    return `Successfully renamed ${params.oldPath} to ${params.newPath}`;
  }
}
