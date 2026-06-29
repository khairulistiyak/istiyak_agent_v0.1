import { classifyAndRoute } from "../llm/ModelManager.js";

/**
 * Classifies user tasks as "quick" (single-step fixes) or "complex" (multi-step work).
 * Quick tasks skip the Planner and execute directly; complex tasks get a full plan.
 */
export class TaskClassifier {
  // Keywords that strongly indicate a quick, single-action task
  private static readonly QUICK_KEYWORDS = [
    "fix typo", "add import", "rename variable", "remove unused",
    "fix syntax", "add comment", "update version", "change color",
    "fix indent", "add semicolon", "remove console.log", "fix spacing",
    "update text", "change string", "fix lint", "format code",
    "add newline", "remove whitespace", "fix case", "capitalize"
  ];

  // Keywords that strongly indicate a complex, multi-step task
  private static readonly COMPLEX_KEYWORDS = [
    "refactor", "add feature", "implement", "build", "create",
    "debug", "investigate", "redesign", "migrate", "upgrade",
    "integrate", "optimize", "architecture", "rewrite", "overhaul",
    "deploy", "configure", "setup", "convert", "transform",
    "add tests", "write tests", "full review", "security audit"
  ];

  /**
   * Classifies a task description into "quick" or "complex".
   * Uses keyword-based heuristics: checks if the task matches quick patterns
   * (simple fixes, renames) vs complex patterns (refactors, new features).
   */
  static classify(taskDescription: string, provider?: string): "quick" | "complex" {
    const task = taskDescription.toLowerCase().trim();

    // Short tasks (under 50 chars) with quick keywords → quick
    if (task.length < 50) {
      const isQuick = TaskClassifier.QUICK_KEYWORDS.some(kw => task.includes(kw));
      if (isQuick) return "quick";
    }

    // Any complex keyword found → complex
    const isComplex = TaskClassifier.COMPLEX_KEYWORDS.some(kw => task.includes(kw));
    if (isComplex) return "complex";

    // Heuristic: tasks with multiple sentences or over 200 chars are likely complex
    const sentenceCount = task.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    if (sentenceCount >= 3 || task.length > 200) return "complex";

    // Tasks mentioning multiple files → complex
    const filePatterns = task.match(/\b[\w-]+\.(ts|js|tsx|jsx|css|json|md)\b/g);
    if (filePatterns && filePatterns.length >= 2) return "complex";

    // Default: quick (bias toward speed; complex only when explicitly needed)
    return "quick";
  }

  /**
   * Classifies and returns the suggested model route.
   * Delegates to ModelManager's classifyAndRoute for provider-specific routing.
   */
  static classifyAndRoute(taskDescription: string, provider: string): string {
    return classifyAndRoute(taskDescription, provider);
  }
}
