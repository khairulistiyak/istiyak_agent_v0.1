import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface MoveParams {
  sourcePath: string;
  destPath: string;
}

export class MoveTool extends BaseTool<MoveParams, { success: boolean }> {
  public readonly name = "move_file";
  public readonly description = "Moves a file or directory to a different location within the workspace.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      sourcePath: { type: "string", description: "The path to the file/directory to move." },
      destPath: { type: "string", description: "The destination path." }
    },
    required: ["sourcePath", "destPath"]
  };

  public async execute(params: MoveParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const srcAbs = path.resolve(workspace, params.sourcePath);
    const destAbs = path.resolve(workspace, params.destPath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(srcAbs);
    guard.assertSafePath(destAbs);

    await fs.mkdir(path.dirname(destAbs), { recursive: true });
    await fs.rename(srcAbs, destAbs);
    return { success: true };
  }
}

export default MoveTool;
