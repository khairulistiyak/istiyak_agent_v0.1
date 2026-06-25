import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface ReadFileParams {
  filePath: string;
}

export class ReadFileTool extends BaseTool<ReadFileParams, string> {
  public readonly name = "read_file";
  public readonly description = "Reads the content of a file in the workspace.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Path to the file to read (relative to workspace or absolute)." }
    },
    required: ["filePath"]
  };

  public async execute(params: ReadFileParams, context: ToolContext): Promise<string> {
    const workspace = context.workspacePath;
    const targetFile = path.resolve(workspace, params.filePath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetFile);

    return await fs.readFile(targetFile, "utf8");
  }
}

export default ReadFileTool;
