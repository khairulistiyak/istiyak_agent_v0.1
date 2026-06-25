import { ToolContext } from "./ToolContext.js";

export abstract class BaseTool<TParams = any, TResult = any> {
  public abstract readonly name: string;
  public abstract readonly description: string;
  public abstract readonly parametersSchema: Record<string, any>;
  public readonly approveRequired: boolean = false;

  public abstract execute(
    params: TParams,
    context: ToolContext
  ): Promise<TResult>;
}
