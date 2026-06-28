import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class UrlContextTool extends BaseTool {
  name = "url_context";
  description = "Fetches plain text content from a URL, stripping HTML tags.";
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
        return `Failed to fetch URL: ${res.statusText}`;
      }
      const html = await res.text();
      const clean = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return clean.substring(0, 10000);
    } catch (e: any) {
      return `Failed to get URL context: ${e.message}`;
    }
  }
}
