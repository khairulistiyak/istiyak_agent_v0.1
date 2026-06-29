import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { ToolValidator } from "./ToolValidator.js";

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

    // Validate parameters before execution
    if (tool.parameterSchema && params) {
      const validationResult = ToolValidator.validateDetailed(tool.parameterSchema, params);
      if (!validationResult.valid) {
        throw new Error(`Parameter validation failed for tool "${name}": ${ToolValidator.formatErrors(validationResult)}`);
      }
    }

    return await tool.execute(params, context);
  }
}
