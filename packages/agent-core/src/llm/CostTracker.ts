// Model-specific pricing per 1M tokens (USD)
// Sources: provider official pricing pages (updated 2026)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // --- Gemini ---
  "gemini-2.5-flash": { input: 0.15, output: 0.6 },
  "gemini-2.5-pro": { input: 1.25, output: 5.0 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-2.0-flash-lite": { input: 0.075, output: 0.3 },

  // --- OpenAI ---
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "o3-mini": { input: 1.1, output: 4.4 },

  // --- Claude ---
  "claude-sonnet-4": { input: 3.0, output: 15.0 },
  "claude-haiku-3.5": { input: 0.8, output: 4.0 },

  // --- DeepSeek ---
  "deepseek-chat": { input: 0.14, output: 0.28 },
  "deepseek-coder": { input: 0.14, output: 0.28 },

  // Fallback per-provider estimate (when specific model isn't listed)
  _gemini: { input: 0.15, output: 0.6 }, // conservative Flash estimate
  _openai: { input: 2.5, output: 10.0 },
  _claude: { input: 3.0, output: 15.0 },
  _deepseek: { input: 0.14, output: 0.28 },
};

/** Session-level running cost tracker */
let sessionTotalCost = 0;
let sessionCallCount = 0;
let sessionInputTokens = 0;
let sessionOutputTokens = 0;
let costBudgetLimit = 1.0; // Default $1 budget per session

export function calculateCost(
  provider: string,
  inputTokens: number,
  outputTokens: number,
  model?: string
): number {
  const pricingRule = getPricingRule(provider, model);
  const inputCost = (inputTokens / 1_000_000) * pricingRule.input;
  const outputCost = (outputTokens / 1_000_000) * pricingRule.output;
  const totalCost = inputCost + outputCost;

  // Update session totals
  sessionTotalCost += totalCost;
  sessionCallCount++;
  sessionInputTokens += inputTokens;
  sessionOutputTokens += outputTokens;

  return totalCost;
}

export function getSessionCost() {
  return {
    totalCost: parseFloat(sessionTotalCost.toFixed(6)),
    callCount: sessionCallCount,
    totalInputTokens: sessionInputTokens,
    totalOutputTokens: sessionOutputTokens,
    budgetLimit: costBudgetLimit,
    budgetUsedPercent: parseFloat(((sessionTotalCost / costBudgetLimit) * 100).toFixed(2)),
    isOverBudget: sessionTotalCost > costBudgetLimit,
  };
}

export function setCostBudget(limit: number) {
  costBudgetLimit = limit;
}

export function resetSessionCost() {
  sessionTotalCost = 0;
  sessionCallCount = 0;
  sessionInputTokens = 0;
  sessionOutputTokens = 0;
}

function getPricingRule(provider: string, model?: string) {
  const p = provider.toLowerCase();
  const m = (model || "").toLowerCase();

  if (p.includes("ollama") || p.includes("custom")) {
    return { input: 0, output: 0 };
  }

  // Try exact model match first
  if (m && MODEL_PRICING[m]) {
    return MODEL_PRICING[m];
  }

  // Partial model name match
  if (m) {
    for (const [key, price] of Object.entries(MODEL_PRICING)) {
      if (key.startsWith("_")) continue; // skip fallbacks
      if (m.includes(key)) return price;
    }
  }

  // Fallback by provider
  if (p.includes("gemini") || p.includes("vertex")) return MODEL_PRICING._gemini;
  if (p.includes("gpt") || p.includes("openai")) return MODEL_PRICING._openai;
  if (p.includes("claude") || p.includes("anthropic")) return MODEL_PRICING._claude;
  if (p.includes("deepseek")) return MODEL_PRICING._deepseek;
  return MODEL_PRICING._gemini;
}
