export interface ParsedResponse {
  thought: string;
  action?: string;
  params?: Record<string, string>;
}

export class ResponseParser {
  public static parse(rawText: string): ParsedResponse {
    if (!rawText) return { thought: "" };

    // Search for agent step tag
    const stepMatch = rawText.match(/<agent_step\s+([^>]*?)>(.*?)<\/agent_step>/is);
    if (stepMatch) {
      const attrsStr = stepMatch[1];
      const thoughtContent = stepMatch[2];
      
      const nameAttr = attrsStr.match(/name="([^"]+)"/i)?.[1];
      const params: Record<string, string> = {};
      
      const attrPairs = attrsStr.matchAll(/([a-zA-Z0-9_-]+)="([^"]*?)"/gi);
      for (const ap of attrPairs) {
        const k = ap[1];
        const v = ap[2];
        if (k !== "step" && k !== "status" && k !== "name") {
          params[k] = v;
        }
      }

      return {
        thought: thoughtContent.trim(),
        action: nameAttr,
        params
      };
    }

    return {
      thought: rawText.trim()
    };
  }
}
export default ResponseParser;
