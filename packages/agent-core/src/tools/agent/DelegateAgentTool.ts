import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { Planner } from "../../agent/Planner.js";
import { TaskClassifier } from "../../agent/TaskClassifier.js";

export class DelegateAgentTool extends BaseTool {
  name = "delegate_task";
  description = "Delegates a sub-task by creating a detailed plan and optionally executing it via a sub-agent. Returns the plan and execution result.";
  parameterSchema = {
    type: "object",
    required: ["task"],
    properties: {
      task: {
        type: "string",
        description: "The sub-task to delegate and plan"
      },
      priority: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Priority level for the sub-task"
      },
      autoExecute: {
        type: "boolean",
        description: "If true, automatically execute the plan via a sub-agent. Default: false"
      }
    }
  };

  async execute(params: { task: string; priority?: string; autoExecute?: boolean }, context: ToolContext): Promise<string> {
    try {
      const classification = TaskClassifier.classify(params.task);
      const steps = Planner.generatePlan(params.task);
      const priority = params.priority || "medium";

      // Write plan to workspace
      const workspacePath = context.workspacePath || process.cwd();
      try {
        await Planner.writePlanToFile(workspacePath, params.task, steps);
      } catch {
        // Plan file write is optional
      }

      const stepsFormatted = steps
        .map((step, i) => `  ${i + 1}. ${step}`)
        .join("\n");

      let executionResult = "";

      // Auto-execute via sub-agent if requested
      if (params.autoExecute) {
        try {
          const { runAgent } = await import("../../agent/AgentRunner.js");
          const config = (context as any)._agentConfig || {};

          let subOutput = "";
          const result = await runAgent({
            messages: [{ role: "user" as const, content: `Execute this plan step by step:\n\n${stepsFormatted}\n\nOriginal task: ${params.task}` }],
            provider: config.provider || "gemini",
            model: config.model || "gemini-2.5-flash",
            authMethod: config.authMethod || "apiKey",
            apiKey: config.apiKey || "",
            serviceAccountPath: config.serviceAccountPath || "",
            projectId: config.projectId || "",
            location: config.location || "global",
            workspacePath,
            googleSearchEnabled: false,
            onChunk: (chunk: string) => { subOutput += chunk; }
          });

          executionResult = `\n\n## Execution Result\n${subOutput.substring(0, 5000)}`;
        } catch (execErr: any) {
          executionResult = `\n\n## Execution Failed\n${execErr.message}`;
        }
      }

      return `## Delegated Task Plan\n\n` +
        `**Task:** ${params.task}\n` +
        `**Classification:** ${classification}\n` +
        `**Priority:** ${priority}\n` +
        `**Steps (${steps.length}):**\n${stepsFormatted}\n\n` +
        `Plan saved to workspace_plan.md.${executionResult}`;
    } catch (err: any) {
      return `Failed to delegate task: ${err.message}`;
    }
  }
}
