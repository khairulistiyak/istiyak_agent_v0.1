import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface PreciseEditParams {
  filePath: string;
  targetContent: string;
  replacementContent: string;
}

export class PreciseEditTool extends BaseTool<PreciseEditParams, { success: boolean }> {
  public readonly name = "precise_edit";
  public readonly description = "Edits a file by replacing a contiguous target block of text with replacement content.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Path to the file to edit." },
      targetContent: { type: "string", description: "The exact content block to find and replace." },
      replacementContent: { type: "string", description: "The content to replace the target block with." }
    },
    required: ["filePath", "targetContent", "replacementContent"]
  };

  public async execute(params: PreciseEditParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetFile = path.resolve(workspace, params.filePath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetFile);

    const content = await fs.readFile(targetFile, "utf8");
    if (!content.includes(params.targetContent)) {
      throw new Error(`Target content was not found in the file: ${params.filePath}`);
    }

    const updatedContent = content.replace(params.targetContent, params.replacementContent);
    await fs.writeFile(targetFile, updatedContent, "utf8");

    return { success: true };
  }
}

export default PreciseEditTool;
