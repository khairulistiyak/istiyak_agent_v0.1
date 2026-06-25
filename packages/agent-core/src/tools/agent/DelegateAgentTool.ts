import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface DelegateAgentParams {
  agentRole: string;
  task: string;
}

export class DelegateAgentTool extends BaseTool<DelegateAgentParams, { success: boolean; output: string }> {
  public readonly name = "delegate_agent";
  public readonly description = "Delegates a specific task to an agent role (e.g. planner, coder, reviewer).";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      agentRole: { type: "string", description: "The role of the sub-agent (e.g., Coder, Reviewer)." },
      task: { type: "string", description: "The task content." }
    },
    required: ["agentRole", "task"]
  };

  public async execute(params: DelegateAgentParams, context: ToolContext) {
    const { AgentRunner } = await import("../../agent/AgentRunner.js");
    const runner = new AgentRunner();
    
    const prompt = `Role: You are acting as a specialized ${params.agentRole}.\nTask: ${params.task}`;
    const output = await runner.runTask(prompt, () => {});

    return { success: true, output };
  }
}

export default DelegateAgentTool;
