import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceGuard } from "../../security/WorkspaceGuard.js";
import fs from "fs/promises";
import path from "path";

export interface SearchParams {
  query: string;
  extension?: string;
}

export interface SearchResult {
  filePath: string;
  lineNumber: number;
  lineContent: string;
}

export class SearchTool extends BaseTool<SearchParams, SearchResult[]> {
  public readonly name = "search_files";
  public readonly description = "Searches for a text query inside all workspace files.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      query: { type: "string", description: "The string pattern to search for." },
      extension: { type: "string", description: "Optional file extension to restrict search (e.g. '.ts')." }
    },
    required: ["query"]
  };

  public async execute(params: SearchParams, context: ToolContext): Promise<SearchResult[]> {
    const workspace = context.workspacePath;
    const guard = new WorkspaceGuard(workspace);
    const results: SearchResult[] = [];

    async function scanDir(dir: string) {
      guard.assertSafePath(dir);
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
            continue;
          }
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          if (params.extension && !entry.name.endsWith(params.extension)) {
            continue;
          }
          try {
            const content = await fs.readFile(fullPath, "utf8");
            if (content.includes(params.query)) {
              const lines = content.split("\n");
              lines.forEach((line: string, index: number) => {
                if (line.includes(params.query)) {
                  results.push({
                    filePath: path.relative(workspace, fullPath),
                    lineNumber: index + 1,
                    lineContent: line.trim()
                  });
                }
              });
            }
          } catch {
            // ignore binary/read errors
          }
        }
      }
    }

    await scanDir(workspace);
    return results.slice(0, 100); // cap results
  }
}

export default SearchTool;
