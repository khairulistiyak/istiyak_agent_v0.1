import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", "target", ".gemini", "out", ".output",
  ".yarn", "vendor", "__pycache__", ".venv", ".tox", "coverage", ".cache", ".parcel-cache",
  ".turbo", ".svn", ".hg", "bower_components", ".idea", ".vscode"
]);

const MAX_SCAN_FILES = 5000;

export class ScanProjectTool extends BaseTool {
  name = "scan_project";
  description = "Scans all files recursively in the project and lists their relative paths. Limited to 5000 files.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    const result: string[] = [];
    const workspacePath = context.workspacePath;
    let limitReached = false;

    const walk = async (dir: string) => {
      if (limitReached) return;
      const list = await fs.readdir(dir, { withFileTypes: true });
      for (const item of list) {
        if (limitReached) return;
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          if (IGNORED_DIRS.has(item.name)) continue;
          await walk(fullPath);
        } else {
          const relPath = path.relative(workspacePath, fullPath);
          result.push(relPath.replace(/\\/g, "/"));
          if (result.length >= MAX_SCAN_FILES) {
            limitReached = true;
            return;
          }
        }
      }
    };

    await walk(workspacePath);
    const suffix = limitReached ? `\n\n[WARNING: Scan limit reached. Showing first ${MAX_SCAN_FILES} of possibly more files.]` : "";
    return `Project scan complete (${result.length} files found):\n${result.join("\n")}${suffix}`;
  }
}
