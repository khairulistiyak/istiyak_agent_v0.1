import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class WalkthroughTool extends BaseTool {
  name = "walkthrough";
  description = "Generates a walkthrough document summarizing the changes made during the task. Reads git diff and modified files to create a structured summary.";
  parameterSchema = {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Title for the walkthrough document"
      },
      changes: {
        type: "string",
        description: "Description of changes made during the task"
      }
    }
  };

  async execute(params: { title?: string; changes?: string }, context: ToolContext): Promise<string> {
    try {
      const workspacePath = context.workspacePath || process.cwd();
      const title = params.title || "Task Walkthrough";
      const changes = params.changes || "No specific changes described.";

      // Try to get git status for recent changes
      let gitStatus = "";
      try {
        const { execFile } = await import("child_process");
        const { promisify } = await import("util");
        const execFilePromise = promisify(execFile);

        const { stdout: statusOut } = await execFilePromise("git", ["status", "--short"], { cwd: workspacePath });
        const { stdout: diffStat } = await execFilePromise("git", ["diff", "--stat", "HEAD~1"], { cwd: workspacePath }).catch(() => ({ stdout: "" }));

        if (statusOut.trim()) {
          gitStatus = `\n### Modified Files\n\`\`\`\n${statusOut.trim()}\n\`\`\`\n`;
        }
        if (diffStat.trim()) {
          gitStatus += `\n### Diff Statistics\n\`\`\`\n${diffStat.trim()}\n\`\`\`\n`;
        }
      } catch {
        gitStatus = "\n*Git status unavailable.*\n";
      }

      // Build walkthrough document
      const walkthroughContent = [
        `# ${title}`,
        ``,
        `**Generated:** ${new Date().toISOString()}`,
        `**Workspace:** ${workspacePath}`,
        ``,
        `## Changes Made`,
        ``,
        changes,
        gitStatus,
        `## Verification`,
        ``,
        `- [ ] Changes compile without errors`,
        `- [ ] Existing tests pass`,
        `- [ ] New functionality works as expected`,
        ``
      ].join("\n");

      // Write to workspace
      const walkthroughPath = path.join(workspacePath, "walkthrough.md");
      await fs.writeFile(walkthroughPath, walkthroughContent, "utf-8");

      return `Walkthrough generated and saved to: ${walkthroughPath}\n\n${walkthroughContent}`;
    } catch (err: any) {
      return `Failed to generate walkthrough: ${err.message}`;
    }
  }
}
