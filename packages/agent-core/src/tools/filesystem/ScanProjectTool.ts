import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", "target", ".gemini", "out", ".output"
]);

export class ScanProjectTool extends BaseTool {
  name = "scan_project";
  description = "Scans all files recursively in the project and lists their relative paths.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string[]> {
    const result: string[] = [];
    const workspacePath = context.workspacePath;

    const walk = async (dir: string) => {
      const list = await fs.readdir(dir, { withFileTypes: true });
      for (const item of list) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          if (IGNORED_DIRS.has(item.name)) continue;
          await walk(fullPath);
        } else {
          const relPath = path.relative(workspacePath, fullPath);
          result.push(relPath.replace(/\\/g, "/"));
        }
      }
    };

    await walk(workspacePath);
    return result;
  }
}
