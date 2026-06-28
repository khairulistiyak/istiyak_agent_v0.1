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
    // Abort after 10 seconds to prevent agent from hanging on slow/unresponsive URLs.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(params.url, { signal: controller.signal });
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
      if (e.name === "AbortError") {
        return `Failed to get URL context: Request timed out after 10 seconds for URL: ${params.url}`;
      }
      return `Failed to get URL context: ${e.message}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
