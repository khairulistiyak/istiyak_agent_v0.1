import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Reads Google CSE credentials from environment variables first,
 * then falls back to the local config file. This is necessary because
 * the Tauri desktop app does not load .env files, so process.env alone
 * would never have these values set from the Settings panel.
 */
function getSearchCredentials(): { apiKey: string; cx: string } {
  const envKey = process.env.GOOGLE_CSE_KEY || "";
  const envCx = process.env.GOOGLE_CSE_CX || "";
  if (envKey && envCx) return { apiKey: envKey, cx: envCx };

  try {
    const configPath = path.join(os.homedir(), ".istiyak_agent_config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return {
        apiKey: config.GOOGLE_CSE_KEY || "",
        cx: config.GOOGLE_CSE_CX || ""
      };
    }
  } catch (_) {
    // ignore config read errors
  }
  return { apiKey: "", cx: "" };
}

export class GoogleSearchTool extends BaseTool {
  name = "google_search";
  description = "Searches Google using Custom Search Engine (CSE) API key.";
  parameterSchema = {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string" }
    }
  };

  async execute(params: { query: string }, context: ToolContext): Promise<string> {
    if ((context as any).googleSearchEnabled === false) {
      return "Google Search is currently disabled in Settings. Enable it to use this tool.";
    }

    const { apiKey, cx } = getSearchCredentials();
    if (!apiKey || !cx) {
      return `Google Search is disabled: GOOGLE_CSE_KEY and GOOGLE_CSE_CX are not configured. Set them in Settings or in the config file.`;
    }

    try {
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(params.query)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return `Search failed with status: ${res.statusText}`;
      }
      const data = await res.json() as any;
      const items = data.items || [];
      return items.map((item: any) => `Title: ${item.title}\nLink: ${item.link}\nSnippet: ${item.snippet}`).join("\n\n");
    } catch (e: any) {
      return `Search failed: ${e.message}`;
    }
  }
}
