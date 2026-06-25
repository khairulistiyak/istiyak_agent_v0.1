import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface RenameParams {
  oldPath: string;
  newPath: string;
}

export class RenameTool extends BaseTool<RenameParams, { success: boolean }> {
  public readonly name = "rename_file";
  public readonly description = "Renames a file or directory inside the workspace.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      oldPath: { type: "string", description: "The original file path." },
      newPath: { type: "string", description: "The new file path." }
    },
    required: ["oldPath", "newPath"]
  };

  public async execute(params: RenameParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const oldAbs = path.resolve(workspace, params.oldPath);
    const newAbs = path.resolve(workspace, params.newPath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(oldAbs);
    guard.assertSafePath(newAbs);

    await fs.rename(oldAbs, newAbs);
    return { success: true };
  }
}

export default RenameTool;
