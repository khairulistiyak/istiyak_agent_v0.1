import { PLANNING_TEMPLATE } from "@istiyak/agent-prompts";

export function getPlanningPrompt(taskDescription: string): string {
  return PLANNING_TEMPLATE + `\nTask to plan:\n${taskDescription}`;
}

export default getPlanningPrompt;
