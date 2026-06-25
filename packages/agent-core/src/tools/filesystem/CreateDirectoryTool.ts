import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface CreateDirectoryParams {
  dirPath: string;
}

export class CreateDirectoryTool extends BaseTool<CreateDirectoryParams, { success: boolean }> {
  public readonly name = "create_directory";
  public readonly description = "Creates a directory structure at the specified workspace path.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      dirPath: { type: "string", description: "The path of the directory to create." }
    },
    required: ["dirPath"]
  };

  public async execute(params: CreateDirectoryParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetDir = path.resolve(workspace, params.dirPath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetDir);

    await fs.mkdir(targetDir, { recursive: true });
    return { success: true };
  }
}

export default CreateDirectoryTool;
