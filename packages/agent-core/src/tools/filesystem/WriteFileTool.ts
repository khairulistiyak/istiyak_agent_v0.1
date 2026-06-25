import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface WriteFileParams {
  filePath: string;
  content: string;
}

export class WriteFileTool extends BaseTool<WriteFileParams, { success: boolean; filePath: string }> {
  public readonly name = "write_file";
  public readonly description = "Creates or overwrites a file with new content.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      filePath: { type: "string", description: "Path to the file to write (relative or absolute)." },
      content: { type: "string", description: "The content to write into the file." }
    },
    required: ["filePath", "content"]
  };

  public async execute(params: WriteFileParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetFile = path.resolve(workspace, params.filePath);

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetFile);

    // Ensure parent directory exists
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, params.content, "utf8");

    return { success: true, filePath: params.filePath };
  }
}

export default WriteFileTool;
