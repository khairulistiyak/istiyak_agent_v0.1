import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

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

  async execute(params: { relPath: string; targetContent: string; replacementContent: string }, context: ToolContext): Promise<void> {
    const fullPath = path.resolve(context.workspacePath, params.relPath);
    if (!fullPath.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    const content = await fs.readFile(fullPath, "utf-8");
    if (!content.includes(params.targetContent)) {
      throw new Error(`Precise Edit Error: Target content not found in ${params.relPath}`);
    }

    const occurrences = content.split(params.targetContent).length - 1;
    if (occurrences > 1) {
      throw new Error(`Precise Edit Error: Ambiguous match. Found ${occurrences} occurrences of target content in ${params.relPath}. Make targetContent more unique.`);
    }

    const updatedContent = content.replace(params.targetContent, params.replacementContent);
    await fs.writeFile(fullPath, updatedContent, "utf-8");
  }
}
