
export function classifyAndRoute(content: string, provider: string): string {
  const complexityKeywords = [
    "refactor", "optimize", "debug", "error", "write tests", "implement", "fix bug", 
    "architecture", "race condition", "memory leak", "performance", "class", "database"
  ];

  const isComplex = complexityKeywords.some(keyword => content.toLowerCase().includes(keyword)) || content.length > 1200;
  const p = provider.toLowerCase();

  if (p === "gemini") {
    return isComplex ? "gemini-2.5-pro" : "gemini-2.5-flash";
  } else if (p === "openai") {
    return isComplex ? "gpt-4o" : "gpt-4o-mini";
  } else if (p === "claude" || p === "anthropic") {
    return isComplex ? "claude-3-5-sonnet-latest" : "claude-3-5-haiku-latest";
  }
  return "gemini-2.5-flash";
}
