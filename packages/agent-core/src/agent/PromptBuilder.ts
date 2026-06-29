import { SystemPrompt } from "../llm/prompts/SystemPrompt.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";
import { WorkspaceMemory } from "../memory/WorkspaceMemory.js";

export class PromptBuilder {
  /**
   * Builds the system prompt with injected tool declarations.
   * Filters out [NOT_IMPLEMENTED] tools so they don't appear as available.
   */
  static buildSystemPrompt(): string {
    const tools = ToolRegistry.getAll();
    const implementedTools = tools.filter(t => !t.description.includes("[NOT_IMPLEMENTED]"));
    const toolDeclarations = implementedTools
      .map(t => `### Tool: \`${t.name}\`\n**Description:** ${t.description}\n**Parameters:**\n\`\`\`json\n${JSON.stringify(t.parameterSchema, null, 2)}\n\`\`\``)
      .join("\n\n---\n\n");
    return `${SystemPrompt}\n\n---\n\n## AVAILABLE TOOLS\n\n${toolDeclarations}`;
  }

  /**
   * Builds the system prompt with workspace-specific rules injected.
   * Call this when a workspacePath is available to personalize the prompt.
   */
  static async buildSystemPromptWithWorkspace(workspacePath: string): Promise<string> {
    const basePrompt = PromptBuilder.buildSystemPrompt();
    try {
      const workspaceMemory = new WorkspaceMemory(workspacePath);
      const rulesSection = await workspaceMemory.getRulesAsPrompt();
      if (rulesSection) {
        return basePrompt + rulesSection;
      }
    } catch {
      // If workspace memory is unavailable, use base prompt
    }
    return basePrompt;
  }

  /**
   * Builds the user prompt, optionally injecting RAG context.
   */
  static buildUserPrompt(task: string, matches: any[]): string {
    if (matches.length === 0) return task;
    const contextText =
      "\n\n[System RAG Context: Relevant codebase snippets retrieved for this task]\n" +
      matches
        .map(m => `File: ${m.relativePath} (Lines ${m.startLine}-${m.endLine})\n\`\`\`\n${m.text}\n\`\`\``)
        .join("\n\n");
    return `${task}${contextText}`;
  }
}
