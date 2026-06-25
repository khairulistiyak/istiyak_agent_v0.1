import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface ListFilesParams {
  dirPath?: string;
}

export class ListFilesTool extends BaseTool<ListFilesParams, Array<{ name: string; isDirectory: boolean; size?: number }>> {
  public readonly name = "list_files";
  public readonly description = "Lists files and subdirectories directly inside a specific directory path.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      dirPath: { type: "string", description: "Target directory path. Defaults to workspace root." }
    }
  };

  public async execute(params: ListFilesParams, context: ToolContext) {
    const workspace = context.workspacePath;
    const targetDir = params.dirPath ? path.resolve(workspace, params.dirPath) : workspace;

    const guard = new WorkspaceGuard(workspace);
    guard.assertSafePath(targetDir);

    const entries = await fs.readdir(targetDir, { withFileTypes: true });
    const result = [];

    for (const entry of entries) {
      const fullPath = path.join(targetDir, entry.name);
      let size: number | undefined;
      if (entry.isFile()) {
        try {
          const stat = await fs.stat(fullPath);
          size = stat.size;
        } catch {
          // ignore stat errors
        }
      }
      result.push({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        size
      });
    }

    return result;
  }
}

export default ListFilesTool;
