import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

// Module-level lock set — mirrors the pattern used in WriteFileTool
// to prevent concurrent reads and writes on the same file path.
const locks = new Set<string>();

export class PreciseEditTool extends BaseTool {
  name = "precise_edit";
  description = "Edits specific parts of a target file. Replaces a unique target chunk with replacement content.";
  parameterSchema = {
    type: "object",
    required: ["relPath", "targetContent", "replacementContent"],
    properties: {
      relPath: { type: "string" },
      targetContent: { type: "string" },
      replacementContent: { type: "string" }
    }
  };

  async execute(params: { relPath: string; targetContent: string; replacementContent: string }, context: ToolContext): Promise<string> {
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
      const normalizedTarget = params.targetContent.replace(/\r\n/g, "\n");
      const normalizedReplacement = params.replacementContent.replace(/\r\n/g, "\n");

      if (!normalizedContent.includes(normalizedTarget)) {
        throw new Error(`Precise Edit Error: Target content not found in ${params.relPath}. Check line endings and indentation.`);
      }

      const occurrences = normalizedContent.split(normalizedTarget).length - 1;
      if (occurrences > 1) {
        throw new Error(`Precise Edit Error: Ambiguous match. Found ${occurrences} occurrences of target content in ${params.relPath}. Make targetContent more unique.`);
      }

      const updatedNormalized = normalizedContent.replace(normalizedTarget, normalizedReplacement);
      
      // Convert back to original line endings if file originally had CRLF
      const updatedContent = rawContent.includes("\r\n") 
        ? updatedNormalized.replace(/\n/g, "\r\n") 
        : updatedNormalized;

      await fs.writeFile(fullPath, updatedContent, "utf-8");
      return `Successfully edited ${params.relPath}. Replaced ${params.targetContent.length} chars with ${params.replacementContent.length} chars.`;
    } finally {
      locks.delete(fullPath);
    }
  }
}
