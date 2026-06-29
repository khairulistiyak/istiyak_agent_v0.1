import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class CrawlWebsiteTool extends BaseTool {
  name = "crawl_website";
  description = "Recursively crawls a website starting from a URL, following same-domain links up to a specified depth. Returns the text content of all crawled pages.";
  parameterSchema = {
    type: "object",
    required: ["url"],
    properties: {
      url: {
        type: "string",
        description: "The starting URL to crawl"
      },
      maxDepth: {
        type: "number",
        description: "Maximum crawl depth (default: 2, max: 3)"
      },
      maxPages: {
        type: "number",
        description: "Maximum number of pages to crawl (default: 5, max: 10)"
      }
    }
  };

  async execute(params: { url: string; maxDepth?: number; maxPages?: number }, context: ToolContext): Promise<string> {
    const maxDepth = Math.min(params.maxDepth || 2, 3);
    const maxPages = Math.min(params.maxPages || 5, 10);
    const visited = new Set<string>();
    const results: Array<{ url: string; title: string; content: string }> = [];

    const baseDomain = this.extractDomain(params.url);
    if (!baseDomain) {
      return `Error: Invalid URL: ${params.url}`;
    }

    await this.crawlPage(params.url, baseDomain, 0, maxDepth, maxPages, visited, results);

    if (results.length === 0) {
      return `No pages could be crawled from ${params.url}`;
    }

    const output = results.map((r, i) =>
      `--- Page ${i + 1}: ${r.url} ---\nTitle: ${r.title}\n\n${r.content.substring(0, 3000)}`
    ).join("\n\n");

    return `Crawled ${results.length} page(s) from ${baseDomain}:\n\n${output}`;
  }

  private extractDomain(url: string): string | null {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return null;
    }
  }

  private async crawlPage(
    url: string,
    baseDomain: string,
    depth: number,
    maxDepth: number,
    maxPages: number,
    visited: Set<string>,
    results: Array<{ url: string; title: string; content: string }>
  ): Promise<void> {
    if (depth > maxDepth || visited.size >= maxPages || visited.has(url)) {
      return;
    }

    visited.add(url);

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "IstiyakAgent/1.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) return;

      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled";

      // Extract text content (strip HTML tags)
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      results.push({ url, title, content: textContent });

      // Extract and follow same-domain links
      if (depth < maxDepth && results.length < maxPages) {
        const linkRegex = /href=["']([^"']+)["']/gi;
        let match;
        const links: string[] = [];

        while ((match = linkRegex.exec(html)) !== null) {
          try {
            const absoluteUrl = new URL(match[1], url).href;
            const linkDomain = new URL(absoluteUrl).hostname;
            if (
              linkDomain === baseDomain &&
              !visited.has(absoluteUrl) &&
              !absoluteUrl.includes("#") &&
              !absoluteUrl.match(/\.(jpg|jpeg|png|gif|svg|css|js|pdf|zip|mp4|mp3)$/i)
            ) {
              links.push(absoluteUrl);
            }
          } catch {
            // Invalid URL, skip
          }
        }

        // Crawl child links (limit to first 5 unique links per page)
        for (const link of links.slice(0, 5)) {
          if (results.length >= maxPages) break;
          await this.crawlPage(link, baseDomain, depth + 1, maxDepth, maxPages, visited, results);
        }
      }
    } catch (err: any) {
      // Skip failed pages silently
      console.warn(`[CrawlWebsite] Failed to crawl ${url}: ${err.message}`);
    }
  }
}
