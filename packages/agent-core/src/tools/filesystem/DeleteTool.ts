import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface DeleteParams {
  filePath: string;
}

export class DeleteTool extends BaseTool<DeleteParams, { success: boolean }> {
  public readonly name = "delete_file";
  public readonly description = "Deletes a file or directory from the workspace.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Path to the file or directory to delete." }
    },
    required: ["filePath"]
  };

  public async execute(params: DeleteParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetFile = path.resolve(workspace, params.filePath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetFile);

    await fs.rm(targetFile, { recursive: true, force: true });
    return { success: true };
  }
}

export default DeleteTool;
