import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface CrawlParams {
  url: string;
  maxPages?: number;
}

export class CrawlWebsiteTool extends BaseTool<CrawlParams, string[]> {
  public readonly name = "crawl_website";
  public readonly description = "Crawls a website starting from a URL and extracts internal links.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      url: { type: "string", description: "The starting URL." },
      maxPages: { type: "number", description: "Max number of pages to scan. Defaults to 5." }
    },
    required: ["url"]
  };

  public async execute(params: CrawlParams, context: ToolContext): Promise<string[]> {
    const startUrl = params.url;
    const maxPages = params.maxPages || 5;
    const visited = new Set<string>();
    const toVisit: string[] = [startUrl];

    let urlObj: URL;
    try {
      urlObj = new URL(startUrl);
    } catch {
      throw new Error(`Invalid start URL format: ${startUrl}`);
    }

    const domain = urlObj.hostname;

    while (toVisit.length > 0 && visited.size < maxPages) {
      const currentUrl = toVisit.shift()!;
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);

      try {
        const response = await fetch(currentUrl);
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
          continue;
        }

        const html = await response.text();
        
        // Extract links: href="url"
        const hrefRegex = /href="([^"]+)"/g;
        let match;
        while ((match = hrefRegex.exec(html)) !== null) {
          const rawLink = match[1];
          try {
            const resolved = new URL(rawLink, currentUrl);
            // Limit to same host
            if (resolved.hostname === domain && !visited.has(resolved.href)) {
              toVisit.push(resolved.href);
            }
          } catch {
            // ignore malformed urls
          }
        }
      } catch {
        // ignore fetch failures during crawling
      }
    }

    return Array.from(visited);
  }
}

export default CrawlWebsiteTool;
