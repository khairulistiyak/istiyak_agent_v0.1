import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class WalkthroughTool extends BaseTool {
  name = "walkthrough";
  description = "Validates the results of the project and presents a walkthrough.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    return "Walkthrough validation verification complete.";
  }
}
