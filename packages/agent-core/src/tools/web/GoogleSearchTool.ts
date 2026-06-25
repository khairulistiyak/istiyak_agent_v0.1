import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export interface GoogleSearchParams {
  query: string;
}

export class GoogleSearchTool extends BaseTool<GoogleSearchParams, Array<{ title: string; link: string; snippet: string }>> {
  public readonly name = "google_search";
  public readonly description = "Performs a Google search for the specified query.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query query." }
    },
    required: ["query"]
  };

  public async execute(params: GoogleSearchParams, context: ToolContext) {
    const serperKey = process.env.SERPER_API_KEY;
    
    if (serperKey) {
      try {
        const response = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: {
            "X-API-KEY": serperKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ q: params.query })
        });
        if (response.ok) {
          const data: any = await response.json();
          const results = data.organic || [];
          return results.map((r: any) => ({
            title: r.title || "",
            link: r.link || "",
            snippet: r.snippet || ""
          }));
        }
      } catch (err) {
        console.error("Serper API error: ", err);
      }
    }

    // Default simulated results
    return [
      {
        title: `Search Result for ${params.query}`,
        link: `https://www.google.com/search?q=${encodeURIComponent(params.query)}`,
        snippet: `This is a simulated search result for query: "${params.query}". Configure SERPER_API_KEY to retrieve live web results.`
      }
    ];
  }
}

export default GoogleSearchTool;
