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
    // This tool is not yet implemented. Returning an honest NOT_IMPLEMENTED response
    // so the agent does not falsely believe a sub-agent was spawned and proceed incorrectly.
    return "[NOT_IMPLEMENTED] Sub-agent spawning is not yet available in this version. Please execute the instructions directly without spawning a sub-agent.";
  }
}
