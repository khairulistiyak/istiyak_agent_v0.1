export const SUMMARY_TEMPLATE = `
Summarize the following execution steps, logs, or context to be extremely concise, keeping only the critical files, errors, and outcomes:
{{content}}

Provide the summary directly.
`;

export function getSummaryPrompt(content: string): string {
  return SUMMARY_TEMPLATE.replace("{{content}}", content);
}

export default getSummaryPrompt;
