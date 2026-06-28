import { SystemPrompt } from "../llm/prompts/SystemPrompt.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";

export class PromptBuilder {
  static buildSystemPrompt(): string {
    const tools = ToolRegistry.getAll();
    const toolDeclarations = tools.map(t => `- Name: ${t.name}\n  Description: ${t.description}\n  Parameters: ${JSON.stringify(t.parameterSchema)}`).join("\n\n");
    return `${SystemPrompt}\n\n### Available Tools:\n${toolDeclarations}`;
  }

  static buildUserPrompt(task: string, matches: any[]): string {
    if (matches.length === 0) return task;
    const contextText = "\n\n[System RAG Context]\n" + 
      matches.map(m => `File: ${m.relativePath} (Lines ${m.startLine}-${m.endLine})\n\`\`\`\n${m.text}\n\`\`\``).join("\n\n");
    return `${task}${contextText}`;
  }
}
