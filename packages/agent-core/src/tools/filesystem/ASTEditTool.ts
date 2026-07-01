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
      const rawContent = await fs.readFile(fullPath, "utf-8");
      
      // Normalize line endings to LF (\n) to prevent CRLF mismatch issues
      const normalizedContent = rawContent.replace(/\r\n/g, "\n");
      const normalizedPattern = params.pattern.replace(/\r\n/g, "\n");
      const normalizedReplacement = params.replacement.replace(/\r\n/g, "\n");

      if (!normalizedContent.includes(normalizedPattern)) {
        throw new Error(`Pattern not found in file: ${params.relPath}. Check line endings and indentation.`);
      }

      // Use split/join instead of .replace() to substitute ALL occurrences.
      // String.prototype.replace() with a string argument only replaces the FIRST match.
      const occurrences = normalizedContent.split(normalizedPattern).length - 1;
      const updatedNormalized = normalizedContent.split(normalizedPattern).join(normalizedReplacement);
      
      // Convert back to original line endings if file originally had CRLF
      const updatedContent = rawContent.includes("\r\n")
        ? updatedNormalized.replace(/\n/g, "\r\n")
        : updatedNormalized;

      await fs.writeFile(fullPath, updatedContent, "utf-8");
      return `AST edit on ${params.relPath} succeeded. Replaced ${occurrences} occurrence(s).`;
    } finally {
      locks.delete(fullPath);
    }
  }
}
