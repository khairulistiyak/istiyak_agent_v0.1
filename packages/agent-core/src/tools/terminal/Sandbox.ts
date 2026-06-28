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
    // Not yet implemented — this tool simulates sandbox execution without actually running
    // anything in Docker. Return honest response so the agent uses run_command instead.
    return `[NOT_IMPLEMENTED] Isolated sandbox execution is not yet available. Use the 'run_command' tool for direct command execution instead.`;
  }
}
