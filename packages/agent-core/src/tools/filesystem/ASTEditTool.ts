import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class ASTEditTool extends BaseTool {
  name = "ast_edit";
  description = "Edits code structures cleanly based on matching patterns.";
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

    const content = await fs.readFile(fullPath, "utf-8");
    if (!content.includes(params.pattern)) {
      throw new Error(`Pattern not found in file: ${params.relPath}`);
    }

    const updated = content.replace(params.pattern, params.replacement);
    await fs.writeFile(fullPath, updated, "utf-8");
    return `AST edit on ${params.relPath} succeeded.`;
  }
}
