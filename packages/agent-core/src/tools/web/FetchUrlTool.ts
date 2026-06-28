import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class FetchUrlTool extends BaseTool {
  name = "fetch_url";
  description = "Fetches the raw string content of any web page.";
  parameterSchema = {
    type: "object",
    required: ["url"],
    properties: {
      url: { type: "string" }
    }
  };

  async execute(params: { url: string }, context: ToolContext): Promise<string> {
    try {
      const res = await fetch(params.url);
      if (!res.ok) {
        return `Fetch error: ${res.status} ${res.statusText}`;
      }
      return await res.text();
    } catch (e: any) {
      return `Fetch error: ${e.message}`;
    }
  }
}
