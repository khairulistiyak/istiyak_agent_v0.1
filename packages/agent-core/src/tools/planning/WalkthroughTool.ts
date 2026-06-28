import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class WalkthroughTool extends BaseTool {
  name = "walkthrough";
  description = "Validates the results of the project and presents a walkthrough.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    // Not yet implemented — return an honest response so the agent does not
    // falsely believe a walkthrough validation was performed.
    return "[NOT_IMPLEMENTED] Automated walkthrough validation is not yet available. Describe your results directly in the task summary instead.";
  }
}
