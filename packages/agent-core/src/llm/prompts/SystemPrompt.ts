import { SYSTEM_PERSONA_TEMPLATE } from "@istiyak/agent-prompts";

export function getSystemPrompt(workspacePath: string): string {
  return SYSTEM_PERSONA_TEMPLATE.replace("{{workspacePath}}", workspacePath);
}

export default getSystemPrompt;
