import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class MergeResultTool extends BaseTool {
  name = "merge_results";
  description = "Merges multiple sub-agent or tool execution results into a single consolidated summary. Deduplicates overlapping information and structures the output.";
  parameterSchema = {
    type: "object",
    required: ["results"],
    properties: {
      results: {
        type: "array",
        description: "Array of result strings to merge",
        items: { type: "string" }
      },
      format: {
        type: "string",
        enum: ["summary", "detailed", "checklist"],
        description: "Output format. Default: summary"
      }
    }
  };

  async execute(params: { results: string[] | string; format?: string }, context: ToolContext): Promise<string> {
    // Handle both array and comma-separated string inputs
    let results: string[];
    if (Array.isArray(params.results)) {
      results = params.results;
    } else if (typeof params.results === "string") {
      results = params.results.split("---").map(r => r.trim()).filter(r => r.length > 0);
    } else {
      return "Error: results parameter must be an array of strings or a single string with --- separators.";
    }

    if (results.length === 0) {
      return "No results to merge.";
    }

    if (results.length === 1) {
      return `## Merged Result\n\n${results[0]}`;
    }

    const format = params.format || "summary";

    // Extract key information from each result
    const filesModified = new Set<string>();
    const errors: string[] = [];
    const successes: string[] = [];

    for (const result of results) {
      // Extract file paths mentioned
      const fileMatches = result.match(/(?:File|Modified|Created|Updated|Wrote):\s*([^\n,]+)/gi);
      if (fileMatches) {
        fileMatches.forEach(m => {
          const path = m.replace(/^(?:File|Modified|Created|Updated|Wrote):\s*/i, "").trim();
          filesModified.add(path);
        });
      }

      // Detect errors vs successes
      if (result.toLowerCase().includes("error") || result.toLowerCase().includes("failed")) {
        errors.push(result.substring(0, 500));
      } else {
        successes.push(result.substring(0, 500));
      }
    }

    if (format === "checklist") {
      const items = results.map((r, i) => `- [x] Task ${i + 1}: ${r.substring(0, 200)}`);
      return `## Merged Results (Checklist)\n\n${items.join("\n")}`;
    }

    if (format === "detailed") {
      const sections = results.map((r, i) => `### Result ${i + 1}\n${r}`);
      return `## Merged Results (Detailed)\n\n${sections.join("\n\n---\n\n")}`;
    }

    // Summary format
    let output = `## Merged Results Summary\n\n`;
    output += `**Total Results:** ${results.length}\n`;
    output += `**Successful:** ${successes.length}\n`;
    output += `**Errors:** ${errors.length}\n`;

    if (filesModified.size > 0) {
      output += `\n### Files Touched\n${Array.from(filesModified).map(f => `- ${f}`).join("\n")}\n`;
    }

    if (successes.length > 0) {
      output += `\n### Successes\n${successes.map((s, i) => `${i + 1}. ${s.substring(0, 200)}`).join("\n")}\n`;
    }

    if (errors.length > 0) {
      output += `\n### Errors\n${errors.map((e, i) => `${i + 1}. ⚠️ ${e.substring(0, 200)}`).join("\n")}\n`;
    }

    return output;
  }
}
