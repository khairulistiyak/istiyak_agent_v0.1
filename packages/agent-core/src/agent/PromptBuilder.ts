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
    const CORE_TOOL_NAMES = [
      "scan_project",
      "list_files",
      "read_file",
      "write_file",
      "precise_edit",
      "search_workspace",
      "run_command",
      "create_plan",
      "update_plan",
      "walkthrough",
      "reflect",
      "git_status",
      "git_diff",
      "git_commit_changes",
      "git_log",
      "google_search",
      "fetch_url",
      "delete_file",
      "create_directory",
      "move_file",
      "rename_file",
      "ast_edit",
      "url_context",
      "crawl_website",
      "delegate_task",
      "spawn_sub_agent",
    ];
    const implementedTools = tools.filter(t => 
      !t.description.includes("[NOT_IMPLEMENTED]") && 
      CORE_TOOL_NAMES.includes(t.name)
    );
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
