export const MemoryPrompt = `When workspace memory context is provided, use it to:
1. Follow any coding conventions, style guides, or project rules found in memory.
2. Reference previously learned patterns about this codebase.
3. Avoid repeating mistakes that were previously corrected.
4. Use the correct file structure, naming conventions, and dependency patterns.
5. Prioritize memory-retrieved context over general knowledge when they conflict.

If RAG context snippets are attached to the user's message, treat them as authoritative references about the current codebase state.`;
