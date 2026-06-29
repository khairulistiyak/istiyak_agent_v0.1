export const SummaryPrompt = `Summarize the conversation history into a concise but complete record. Include:
1. The original user request.
2. Key decisions made during execution.
3. Files that were read, created, or modified.
4. Commands that were run and their outcomes.
5. Any errors encountered and how they were resolved.
6. The final result or current status.

Keep the summary factual and actionable. Omit verbose tool outputs but preserve file paths and error messages.`;
