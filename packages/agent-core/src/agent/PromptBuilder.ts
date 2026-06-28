import { SystemPrompt } from "../llm/prompts/SystemPrompt.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";

export class PromptBuilder {
  static buildSystemPrompt(): string {
    const tools = ToolRegistry.getAll();
    // Filter out stub/unimplemented tools so they don't appear as available to the AI.
    // Showing unimplemented tools causes the AI to attempt using them and then receive
    // [NOT_IMPLEMENTED] responses, wasting steps and causing confusion.
    const implementedTools = tools.filter(t => !t.description.includes("[NOT_IMPLEMENTED]"));
    const toolDeclarations = implementedTools.map(t => `- Name: ${t.name}\n  Description: ${t.description}\n  Parameters: ${JSON.stringify(t.parameterSchema)}`).join("\n\n");
    return `${SystemPrompt}\n\n### Available Tools:\n${toolDeclarations}`;
  }

  static buildUserPrompt(task: string, matches: any[]): string {
    if (matches.length === 0) return task;
    const contextText = "\n\n[System RAG Context]\n" + 
      matches.map(m => `File: ${m.relativePath} (Lines ${m.startLine}-${m.endLine})\n\`\`\`\n${m.text}\n\`\`\``).join("\n\n");
    return `${task}${contextText}`;
  }
}
