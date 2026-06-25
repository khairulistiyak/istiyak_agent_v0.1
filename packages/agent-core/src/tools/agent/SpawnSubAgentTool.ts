import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface SpawnSubAgentParams {
  task: string;
}

export class SpawnSubAgentTool extends BaseTool<SpawnSubAgentParams, { success: boolean; result: string }> {
  public readonly name = "spawn_sub_agent";
  public readonly description = "Spawns a child agent to run a sub-task autonomously.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      task: { type: "string", description: "The sub-task instruction for the child agent." }
    },
    required: ["task"]
  };

  public async execute(params: SpawnSubAgentParams, context: ToolContext) {
    // Dynamic import to avoid circular dependency loop
    const { AgentRunner } = await import("../../agent/AgentRunner.js");
    const runner = new AgentRunner();
    
    let subLogs = "";
    const result = await runner.runTask(params.task, (log) => {
      subLogs += log + "\n";
    });

    return { success: true, result };
  }
}

export default SpawnSubAgentTool;
