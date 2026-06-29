import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { Reflection } from "../../agent/Reflection.js";

export class ReflectTool extends BaseTool {
  name = "reflect";
  description = "Triggers a self-reflection assessment of the current task state. Returns a structured reflection prompt to help reassess the approach.";
  parameterSchema = {
    type: "object",
    properties: {
      stepCount: {
        type: "number",
        description: "Current step number in the task execution"
      },
      lastError: {
        type: "string",
        description: "The last error encountered, if any"
      }
    }
  };

  async execute(params: { stepCount?: number; lastError?: string }, context: ToolContext): Promise<string> {
    try {
      const stepCount = params.stepCount || 0;
      const lastError = params.lastError;

      // Build the reflection prompt
      const reflectionPrompt = Reflection.buildReflectionPrompt(
        [],
        stepCount,
        lastError
      );

      return `## Self-Reflection Assessment\n\n${reflectionPrompt}\n\n` +
        `---\n` +
        `*Reflection triggered at step ${stepCount}.` +
        (lastError ? ` Last error: ${lastError}` : ` No errors detected.`) +
        `*`;
    } catch (err: any) {
      return `Failed to generate reflection: ${err.message}`;
    }
  }
}
