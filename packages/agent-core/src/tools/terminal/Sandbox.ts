import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class Sandbox extends BaseTool {
  name = "sandbox_run";
  description = "Executes command within an isolated Docker DinD environment (stub).";
  parameterSchema = {
    type: "object",
    required: ["command"],
    properties: {
      command: { type: "string" }
    }
  };

  async execute(params: { command: string }, context: ToolContext): Promise<string> {
    return `Sandbox execution of [${params.command}] succeeded (simulated sandbox).`;
  }
}
