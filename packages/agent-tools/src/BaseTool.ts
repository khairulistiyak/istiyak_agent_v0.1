import { ToolContext } from "./ToolContext.js";

export abstract class BaseTool<P = any, R = any> {
  abstract name: string;
  abstract description: string;
  abstract parameterSchema: Record<string, any>;

  abstract execute(params: P, context: ToolContext): Promise<R>;
}
