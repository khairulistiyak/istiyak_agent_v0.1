import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface ASTEditParams {
  filePath: string;
  targetSymbol: string;
  replacementContent: string;
}

export class ASTEditTool extends BaseTool<ASTEditParams, { success: boolean }> {
  public readonly name = "ast_edit";
  public readonly description = "Modifies functions or declarations structurally inside a source code file.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Path to the file to edit." },
      targetSymbol: { type: "string", description: "Name of class, function, or symbol to replace/modify." },
      replacementContent: { type: "string", description: "New content for the target symbol." }
    },
    required: ["filePath", "targetSymbol", "replacementContent"]
  };

  public async execute(params: ASTEditParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetFile = path.resolve(workspace, params.filePath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetFile);

    const fileContent = await fs.readFile(targetFile, "utf8");

    // Fallback: search for symbol block and replace
    // Find declaration: e.g. function targetSymbol, class targetSymbol, targetSymbol =
    const regex = new RegExp(`(function\\s+${params.targetSymbol}\\b[^{]*{([\\s\\S]*?)}|class\\s+${params.targetSymbol}\\b[^{]*{([\\s\\S]*?)}|const\\s+${params.targetSymbol}\\b[\\s\\S]*?;)`, "g");
    
    if (!regex.test(fileContent)) {
      throw new Error(`Symbol '${params.targetSymbol}' could not be located in ${params.filePath}`);
    }

    const updatedContent = fileContent.replace(regex, params.replacementContent);
    await fs.writeFile(targetFile, updatedContent, "utf8");

    return { success: true };
  }
}

export default ASTEditTool;
