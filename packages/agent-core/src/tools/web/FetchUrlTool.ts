import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface FetchUrlParams {
  url: string;
}

export class FetchUrlTool extends BaseTool<FetchUrlParams, string> {
  public readonly name = "fetch_url";
  public readonly description = "Fetches content from a URL and parses HTML to clean text.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      url: { type: "string", description: "The HTTP/HTTPS URL to fetch." }
    },
    required: ["url"]
  };

  public async execute(params: FetchUrlParams, context: ToolContext): Promise<string> {
    try {
      const response = await fetch(params.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IstiyakAgent/1.0;)"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      
      // Clean HTML tags quickly
      let text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return text.slice(0, 50000); // cap size
    } catch (error: any) {
      throw new Error(`FetchUrl Error: ${error.message}`);
    }
  }
}

export default FetchUrlTool;
