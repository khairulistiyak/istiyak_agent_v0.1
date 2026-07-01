import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class SpawnSubAgentTool extends BaseTool {
  name = "spawn_sub_agent";
  description = "Spawns a real sub-agent that executes a focused task using the same LLM provider. The sub-agent runs independently with its own context and returns the result.";
  parameterSchema = {
    type: "object",
    required: ["instructions"],
    properties: {
      instructions: {
        type: "string",
        description: "Detailed instructions for the sub-agent task"
      },
      scope: {
        type: "string",
        description: "Scope of files/directories the sub-agent should focus on"
      },
      maxSteps: {
        type: "number",
        description: "Maximum steps for the sub-agent (default: 10, max: 20)"
      }
    }
  };

  async execute(params: { instructions: string; scope?: string; maxSteps?: number }, context: ToolContext): Promise<string> {
    try {
      const subAgentId = `sub-${Date.now().toString(36)}`;
      const maxSteps = Math.min(params.maxSteps || 10, 20);

      console.log(`[SubAgent:${subAgentId}] Starting with instructions: ${params.instructions.substring(0, 100)}...`);

      // Dynamically import runAgent to avoid circular dependency
      const { runAgent } = await import("../../agent/AgentRunner.js");

      const scopeInfo = params.scope ? `\nFocus on: ${params.scope}` : "";
      const subAgentMessages = [
        {
          role: "user" as const,
          content: `You are a focused sub-agent. Complete this specific task:\n\n${params.instructions}${scopeInfo}\n\nBe concise and efficient. Complete the task in minimal steps.`
        }
      ];

      // Get provider config from the parent context
      const config = (context as any)._agentConfig || {};

      let subAgentOutput = "";
      const parentOnChunk = (context as any)._agentConfig?.onChunk;

      const result = await runAgent({
        messages: subAgentMessages,
        provider: config.provider || "gemini",
        model: config.model || "gemini-2.5-flash",
        authMethod: config.authMethod || "apiKey",
        apiKey: config.apiKey || "",
        serviceAccountPath: config.serviceAccountPath || "",
        projectId: config.projectId || "",
        location: config.location || "global",
        workspacePath: context.workspacePath || process.cwd(),
        googleSearchEnabled: false,
        onChunk: (chunk: string) => {
          subAgentOutput += chunk;
          if (parentOnChunk) {
            parentOnChunk(`<agent_step step="0" status="action" name="sub_agent">${chunk.replace(/</g, '&lt;').replace(/>/g, '&gt;').substring(0, 200)}</agent_step>`);
          }
        }
      });

      console.log(`[SubAgent:${subAgentId}] Completed. Tokens: ${result.inputTokens}in/${result.outputTokens}out`);

      return `## Sub-Agent ${subAgentId} Result\n\n` +
        `**Instructions:** ${params.instructions}\n` +
        `**Tokens Used:** ${result.inputTokens} in / ${result.outputTokens} out\n\n` +
        `**Output:**\n${subAgentOutput.substring(0, 5000)}`;

    } catch (err: any) {
      return `Sub-agent execution failed: ${err.message}. Consider breaking the task into simpler steps and executing them directly.`;
    }
  }
}
