export const MEMORY_TEMPLATE = `
Analyze the execution logs and extract key facts, settings, paths, or findings that should be saved for future context.
Current execution context:
{{logs}}

Format memory items as JSON and enclose within <agent_step name="write_memory">...</agent_step>
`;

export function getMemoryPrompt(logs: string): string {
  return MEMORY_TEMPLATE.replace("{{logs}}", logs);
}

export default getMemoryPrompt;
