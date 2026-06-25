import { BaseTool } from "@istiyak/agent-tools";

export class ContextBuilder {
  public static buildWorkspaceContext(
    workspacePath: string,
    memoryFacts: string[],
    tools: BaseTool[]
  ): string {
    const toolsStr = tools.map(t => `- ${t.name}: ${t.description} (Schema: ${JSON.stringify(t.parametersSchema)})`).join("\n");
    const factsStr = memoryFacts.length > 0 ? memoryFacts.map(f => `- ${f}`).join("\n") : "No recorded facts.";

    return `Workspace Directory: ${workspacePath}

Available Tools for your execution:
${toolsStr}

Retrieved Memory Facts:
${factsStr}
`;
  }
}

export default ContextBuilder;
