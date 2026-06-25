import { getSystemPrompt } from "../llm/prompts/SystemPrompt.js";
import { getPlanningPrompt } from "../llm/prompts/PlanningPrompt.js";
import { getReflectionPrompt } from "../llm/prompts/ReflectionPrompt.js";

export class PromptBuilder {
  public static buildSystemPrompt(workspacePath: string): string {
    return getSystemPrompt(workspacePath);
  }

  public static buildPlanningPrompt(task: string): string {
    return getPlanningPrompt(task);
  }

  public static buildReflectionPrompt(task: string, planStatus: string, lastAction: string, lastResult: string): string {
    return getReflectionPrompt(task, planStatus, lastAction, lastResult);
  }
}

export default PromptBuilder;
