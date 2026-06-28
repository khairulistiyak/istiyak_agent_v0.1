import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class CrawlWebsiteTool extends BaseTool {
  name = "crawl_website";
  description = "Crawls a website and extracts relative links.";
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
      if (!res.ok) return `Crawl failed: ${res.statusText}`;
      const html = await res.text();
      const links: string[] = [];
      const regex = /href\s*=\s*['"]?([^'" >]+)/gi;
      let match;
      while ((match = regex.exec(html)) !== null) {
        links.push(match[1]);
      }
      return `Crawled links: ${JSON.stringify(links.slice(0, 20))}`;
    } catch (e: any) {
      return `Crawl failed: ${e.message}`;
    }
  }
}
