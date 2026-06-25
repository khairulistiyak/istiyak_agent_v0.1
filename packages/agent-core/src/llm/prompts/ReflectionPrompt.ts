export const REFLECTION_TEMPLATE = `
You are analyzing the outcome of the last action.
Task: {{taskDescription}}
Plan status: {{planStatus}}
Last action: {{lastAction}}
Last result: {{lastResult}}

Determine if the task is complete. If it is complete, declare success.
If there are errors or missing parts, specify the correction strategy.
Format output inside <agent_step name="reflect">Your reflection thoughts here.</agent_step>
`;

export function getReflectionPrompt(
  taskDescription: string,
  planStatus: string,
  lastAction: string,
  lastResult: string
): string {
  return REFLECTION_TEMPLATE
    .replace("{{taskDescription}}", taskDescription)
    .replace("{{planStatus}}", planStatus)
    .replace("{{lastAction}}", lastAction)
    .replace("{{lastResult}}", lastResult);
}

export default getReflectionPrompt;
