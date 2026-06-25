import { BaseTool, validateParams } from "@istiyak/agent-tools";

export class ToolValidator {
  public static validateTool(tool: BaseTool): void {
    if (!tool.name) throw new Error("Tool must have a name defined.");
    if (!tool.description) throw new Error("Tool must have a description defined.");
    if (!tool.parametersSchema) throw new Error("Tool must have a parametersSchema defined.");
  }

  public static validateArguments(tool: BaseTool, args: Record<string, any>): void {
    validateParams(tool.parametersSchema, args);
  }
}

export default ToolValidator;
