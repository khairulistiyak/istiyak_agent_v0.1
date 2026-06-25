import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface UrlContextParams {
  url: string;
}

export class UrlContextTool extends BaseTool<UrlContextParams, { title: string; headers: Record<string, string>; size: number }> {
  public readonly name = "url_context";
  public readonly description = "Fetches a URL and retrieves metadata, page title, and headers context.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      url: { type: "string", description: "The URL to inspect." }
    },
    required: ["url"]
  };

  public async execute(params: UrlContextParams, context: ToolContext) {
    try {
      const response = await fetch(params.url, { method: "HEAD" });
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Get page title by fetching a small chunk if HTML
      let title = "Unknown Title";
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const getResp = await fetch(params.url);
        const html = await getResp.text();
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim();
        }
      }

      return {
        title,
        headers,
        size: Number(response.headers.get("content-length") || "0")
      };
    } catch (error: any) {
      throw new Error(`UrlContext Error: ${error.message}`);
    }
  }
}

export default UrlContextTool;
