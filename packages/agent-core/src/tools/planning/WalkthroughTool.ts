import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";
import fs from "fs/promises";
import path from "path";

export interface WalkthroughParams {
  content: string;
}

export class WalkthroughTool extends BaseTool<WalkthroughParams, { success: boolean; filePath: string }> {
  public readonly name = "create_walkthrough";
  public readonly description = "Creates a final code walkthrough in the workspace to document changes.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      content: { type: "string", description: "The walkthrough documentation in Markdown format." }
    },
    required: ["content"]
  };

  public async execute(params: WalkthroughParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    store.set("walkthrough", params.content);

    const wtPath = path.join(context.workspacePath, "walkthrough.md");
    await fs.writeFile(wtPath, params.content, "utf8");

    return { success: true, filePath: "walkthrough.md" };
  }
}

export default WalkthroughTool;
