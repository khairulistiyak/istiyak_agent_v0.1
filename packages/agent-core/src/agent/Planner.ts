import { PlanningPrompt } from "../llm/prompts/PlanningPrompt.js";

export class Planner {
  generatePlanningSystemPrompt(): string {
    return PlanningPrompt;
  }
}
