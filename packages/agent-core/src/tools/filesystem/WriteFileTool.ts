import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

const locks = new Set<string>();

export class WriteFileTool extends BaseTool {
  name = "write_file";
  description = "Writes entire contents to a file cleanly. Overwrites if file exists.";
  parameterSchema = {
    type: "object",
    required: ["relPath", "content"],
    properties: {
      relPath: { type: "string" },
      content: { type: "string" }
    }
  };

  async execute(params: { relPath: string; content: string }, context: ToolContext): Promise<string> {
    const fullPath = path.resolve(context.workspacePath, params.relPath);
    if (!fullPath.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    if (locks.has(fullPath)) {
      throw new Error(`File Locking Violation: File is locked by another process: ${params.relPath}`);
    }

    locks.add(fullPath);
    try {
      const parent = path.dirname(fullPath);
      await fs.mkdir(parent, { recursive: true });
      await fs.writeFile(fullPath, params.content, "utf-8");
      return `Successfully wrote ${params.content.length} characters to ${params.relPath}`;
    } finally {
      locks.delete(fullPath);
    }
  }
}
