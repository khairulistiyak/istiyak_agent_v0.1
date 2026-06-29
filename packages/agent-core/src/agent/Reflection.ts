import { ReflectionPrompt } from "../llm/prompts/ReflectionPrompt.js";
import { Message } from "@istiyak/shared-types";

/**
 * Handles self-correction and reflection logic.
 * Determines when the agent should pause and reassess its approach,
 * and builds reflection prompts injected into the conversation.
 */
export class Reflection {
  /** How often (in steps) the agent should automatically reflect */
  private static readonly REFLECTION_INTERVAL = 5;

  /** Error keywords that should trigger immediate reflection */
  private static readonly ERROR_TRIGGERS = [
    "error:", "failed", "permission denied", "not found",
    "enoent", "eacces", "timeout", "syntax error",
    "cannot find", "undefined", "null reference"
  ];

  /**
   * Returns the base reflection system prompt template.
   */
  getSelfCorrectionPrompt(): string {
    return ReflectionPrompt;
  }

  /**
   * Determines whether the agent should pause and reflect.
   * Triggers on:
   *   1. Every N steps (configurable interval)
   *   2. After receiving an error result from a tool
   *   3. After repeated identical tool calls (loop detection)
   */
  static shouldReflect(stepCount: number, lastToolResult: string, recentToolNames?: string[]): boolean {
    // Trigger 1: Periodic reflection every N steps
    if (stepCount > 0 && stepCount % Reflection.REFLECTION_INTERVAL === 0) {
      return true;
    }

    // Trigger 2: Error in last tool result
    if (lastToolResult) {
      const lower = lastToolResult.toLowerCase();
      const hasError = Reflection.ERROR_TRIGGERS.some(trigger => lower.includes(trigger));
      if (hasError) return true;
    }

    // Trigger 3: Loop detection — same tool called 3+ times in a row
    if (recentToolNames && recentToolNames.length >= 3) {
      const last3 = recentToolNames.slice(-3);
      if (last3[0] === last3[1] && last3[1] === last3[2]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Builds a reflection prompt based on the current conversation context.
   * This prompt is injected as a system message to make the agent
   * reassess its approach before continuing.
   */
  static buildReflectionPrompt(context: Message[], stepCount: number, lastError?: string): string {
    const parts: string[] = [
      `[Self-Reflection Check — Step ${stepCount}]`,
      ``,
      `Before continuing, pause and assess your progress:`,
      ``,
      `1. **Goal Check**: What was the original user request? Are you still working toward it?`,
      `2. **Progress Check**: What have you accomplished so far? What remains?`,
      `3. **Approach Check**: Is your current approach working, or should you try something different?`,
      `4. **Error Check**: Have you encountered any errors? If so, what's the root cause?`,
    ];

    if (lastError) {
      parts.push(``);
      parts.push(`⚠️ **Last Error**: ${lastError}`);
      parts.push(`Analyze this error carefully. Do NOT repeat the same action that caused it.`);
      parts.push(`Consider an alternative approach.`);
    }

    // Loop detection warning
    if (context.length >= 6) {
      parts.push(``);
      parts.push(`5. **Loop Check**: Are you repeating the same actions? If so, STOP and try a different strategy.`);
    }

    parts.push(``);
    parts.push(`After reflecting, proceed with the most effective next action.`);

    return parts.join("\n");
  }
}
