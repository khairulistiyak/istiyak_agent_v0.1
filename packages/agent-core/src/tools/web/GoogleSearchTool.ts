import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class GoogleSearchTool extends BaseTool {
  name = "google_search";
  description = "Searches Google using Custom Search Engine (CSE) API key.";
  parameterSchema = {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string" }
    }
  };

  async execute(params: { query: string }, context: ToolContext): Promise<string> {
    const apiKey = process.env.GOOGLE_CSE_KEY;
    const cx = process.env.GOOGLE_CSE_CX;
    if (!apiKey || !cx) {
      return `Google Search is disabled: Missing GOOGLE_CSE_KEY or GOOGLE_CSE_CX environment variables.`;
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(params.query)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return `Search failed with status: ${res.statusText}`;
      }
      const data = await res.json() as any;
      const items = data.items || [];
      return items.map((item: any) => `Title: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`).join("\n\n");
    } catch (e: any) {
      return `Search failed: ${e.message}`;
    }
  }
}
