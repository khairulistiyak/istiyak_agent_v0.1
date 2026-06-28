import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class MoveTool extends BaseTool {
  name = "move_file";
  description = "Moves an existing file or directory to a new location.";
  parameterSchema = {
    type: "object",
    required: ["srcPath", "destPath"],
    properties: {
      srcPath: { type: "string" },
      destPath: { type: "string" }
    }
  };

  async execute(params: { srcPath: string; destPath: string }, context: ToolContext): Promise<string> {
    const cwd = path.resolve(context.workspacePath);
    const src = path.resolve(cwd, params.srcPath);
    const dest = path.resolve(cwd, params.destPath);

    if (!src.startsWith(cwd) || !dest.startsWith(cwd)) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    await fs.rename(src, dest);
    return `Successfully moved ${params.srcPath} to ${params.destPath}`;
  }
}
