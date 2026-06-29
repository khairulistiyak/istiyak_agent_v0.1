import { AgentResponse } from "@istiyak/shared-types";

/**
 * Robust JSON response parser that handles:
 * - Clean JSON
 * - JSON wrapped in ```json``` fences
 * - JSON with leading/trailing text
 * - Multiple JSON blocks (picks the first valid one with "action" field)
 */
export function parseResponse(text: string): AgentResponse {
  // Strategy 1: Direct parse (clean JSON)
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && parsed.action) {
      return parsed as AgentResponse;
    }
  } catch {
    // Not clean JSON, try other strategies
  }

  // Strategy 2: Strip markdown code fences
  let cleanText = trimmed;
  // Remove ```json ... ``` wrapping
  const jsonFenceMatch = cleanText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonFenceMatch) {
    try {
      const parsed = JSON.parse(jsonFenceMatch[1].trim());
      if (parsed && typeof parsed === "object" && parsed.action) {
        return parsed as AgentResponse;
      }
    } catch {
      // Continue to next strategy
    }
  }

  // Strategy 3: Find first { ... } block that contains "action"
  const jsonBlocks: string[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < cleanText.length; i++) {
    if (cleanText[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (cleanText[i] === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        jsonBlocks.push(cleanText.substring(start, i + 1));
        start = -1;
      }
    }
  }

  // Try each extracted JSON block
  for (const block of jsonBlocks) {
    try {
      const parsed = JSON.parse(block);
      if (parsed && typeof parsed === "object" && parsed.action) {
        return parsed as AgentResponse;
      }
    } catch {
      continue;
    }
  }

  // Strategy 4: Try to fix common JSON issues
  // Remove trailing commas before } or ]
  const fixedText = cleanText
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]");

  for (const block of jsonBlocks) {
    try {
      const fixedBlock = block.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
      const parsed = JSON.parse(fixedBlock);
      if (parsed && typeof parsed === "object" && parsed.action) {
        return parsed as AgentResponse;
      }
    } catch {
      continue;
    }
  }

  // All strategies failed
  throw new Error(
    `Failed to extract valid JSON from LLM response. ` +
    `Response starts with: "${trimmed.substring(0, 100)}...". ` +
    `Ensure the response is a valid JSON object with an "action" field.`
  );
}
