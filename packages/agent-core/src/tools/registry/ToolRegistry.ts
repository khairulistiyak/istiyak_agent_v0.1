import { BaseTool } from "@istiyak/agent-tools";

export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  public register(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  public getDeclarations(): Array<{ name: string; description: string; parameters: any }> {
    return this.getAllTools().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parametersSchema
    }));
  }
}
