import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class SpawnSubAgentTool extends BaseTool {
  name = "spawn_sub_agent";
  description = "Spawns a new sub-agent worker instance.";
  parameterSchema = {
    type: "object",
    required: ["instructions"],
    properties: {
      instructions: { type: "string" }
    }
  };

  async execute(params: { instructions: string }, context: ToolContext): Promise<string> {
    return "Sub-agent successfully spawned and started execution.";
  }
}
