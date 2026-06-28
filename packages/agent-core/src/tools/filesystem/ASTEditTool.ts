import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

// Module-level lock set to prevent concurrent edits on the same file path.
const locks = new Set<string>();

export class ASTEditTool extends BaseTool {
  name = "ast_edit";
  description = "Edits code structures cleanly based on matching patterns. Replaces ALL occurrences of the pattern.";
  parameterSchema = {
    type: "object",
    required: ["relPath", "pattern", "replacement"],
    properties: {
      relPath: { type: "string" },
      pattern: { type: "string" },
      replacement: { type: "string" }
    }
  };

  async execute(params: { relPath: string; pattern: string; replacement: string }, context: ToolContext): Promise<string> {
    const fullPath = path.resolve(context.workspacePath, params.relPath);
    if (!fullPath.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    if (locks.has(fullPath)) {
      throw new Error(`File Locking Violation: File is currently being edited by another process: ${params.relPath}`);
    }

    locks.add(fullPath);
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      if (!content.includes(params.pattern)) {
        throw new Error(`Pattern not found in file: ${params.relPath}`);
      }

      // Use split/join instead of .replace() to substitute ALL occurrences.
      // String.prototype.replace() with a string argument only replaces the FIRST match.
      const occurrences = content.split(params.pattern).length - 1;
      const updated = content.split(params.pattern).join(params.replacement);
      await fs.writeFile(fullPath, updated, "utf-8");
      return `AST edit on ${params.relPath} succeeded. Replaced ${occurrences} occurrence(s).`;
    } finally {
      locks.delete(fullPath);
    }
  }
}
