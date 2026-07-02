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
    let targetUrl = params.url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    // Abort after 10 seconds to prevent the agent from hanging indefinitely
    // on slow or unresponsive servers (Node.js fetch has no default timeout).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(targetUrl, { signal: controller.signal });
      if (!res.ok) {
        return `Fetch error: ${res.status} ${res.statusText}`;
      }
      return await res.text();
    } catch (e: unknown) {
      const abortErr = e as { name?: string };
      if (abortErr.name === "AbortError") {
        return `Fetch error: Request timed out after 10 seconds for URL: ${params.url}`;
      }
      return `Fetch error: ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
