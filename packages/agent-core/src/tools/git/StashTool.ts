import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export interface StashParams {
  action?: "push" | "pop" | "list";
}

export class StashTool extends BaseTool<StashParams, string> {
  public readonly name = "git_stash";
  public readonly description = "Stashes uncommitted changes or pops the latest stash item.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      action: { type: "string", description: "The action to perform: push, pop, or list. Defaults to list." }
    }
  };

  public execute(params: StashParams, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      const act = params.action || "list";
      const command = act === "push" ? "git stash push" : act === "pop" ? "git stash pop" : "git stash list";
      exec(command, { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default StashTool;
