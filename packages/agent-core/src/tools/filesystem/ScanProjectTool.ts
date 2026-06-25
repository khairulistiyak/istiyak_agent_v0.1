import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface ScanProjectParams {
  maxDepth?: number;
}

export class ScanProjectTool extends BaseTool<ScanProjectParams, string[]> {
  public readonly name = "scan_project";
  public readonly description = "Recursively scans the workspace directory structure and returns file paths.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      maxDepth: { type: "number", description: "Maximum recursion depth. Defaults to 5." }
    }
  };

  public async execute(params: ScanProjectParams, context: ToolContext): Promise<string[]> {
    const workspace = context.workspacePath;
    const guard = new WorkspaceGuard(workspace);
    const maxDepth = params.maxDepth ?? 5;
    const fileList: string[] = [];

    async function walk(dir: string, depth: number) {
      if (depth > maxDepth) return;
      guard.assertSafePath(dir);
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip node_modules and .git
          if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
            continue;
          }
          await walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          fileList.push(path.relative(workspace, fullPath));
        }
      }
    }

    await walk(workspace, 1);
    return fileList;
  }
}

export default ScanProjectTool;
