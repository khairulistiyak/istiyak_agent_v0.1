import { ProviderType } from "../config/Providers.js";

export class TaskClassifier {
  public static classifyAndRoute(task: string, provider: ProviderType): string {
    const content = task.toLowerCase();
    const complexKeywords = [
      "refactor", "optimize", "debug", "error", "write tests", "implement", "fix bug",
      "architecture", "race condition", "memory leak", "performance", "class", "database"
    ];
    const isComplex = complexKeywords.some(kw => content.includes(kw)) || content.length > 1200;

    if (provider === "gemini") {
      return isComplex ? "gemini-1.5-pro" : "gemini-2.5-flash";
    }
    if (provider === "openai") {
      return "gpt-4o";
    }
    if (provider === "claude") {
      return "claude-3.5-sonnet";
    }
    return "gemini-2.5-flash";
  }
}

export default TaskClassifier;
