import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class ToolRegistry {
  private static tools = new Map<string, BaseTool>();

  static register(tool: BaseTool) {
    this.tools.set(tool.name, tool);
  }

  static get(name: string): BaseTool | undefined {
    return this.tools.get(name);
  }

  static getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  static async execute(name: string, params: any, context: ToolContext): Promise<any> {
    const tool = this.get(name);
    if (!tool) {
      throw new Error(`Tool Registry Error: Tool not found: ${name}`);
    }
    return await tool.execute(params, context);
  }
}
