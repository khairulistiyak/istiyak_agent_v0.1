const PRICING: Record<string, { input: number; output: number }> = {
  gemini: {
    input: 0.075,
    output: 0.30,
  },
  openai: {
    input: 2.50,
    output: 10.00,
  },
  claude: {
    input: 3.00,
    output: 15.00,
  },
  deepseek: {
    input: 0.14,
    output: 0.28,
  },
};

/** Session-level running cost tracker */
let sessionTotalCost = 0;
let sessionCallCount = 0;
let sessionInputTokens = 0;
let sessionOutputTokens = 0;
let costBudgetLimit = 1.0; // Default $1 budget per session

export function calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const pricingRule = getPricingRule(provider);
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

function getPricingRule(provider: string) {
  const p = provider.toLowerCase();
  if (p.includes("ollama") || p.includes("custom")) {
    return { input: 0, output: 0 };
  }
  if (p.includes("gemini") || p.includes("vertex")) return PRICING.gemini;
  if (p.includes("gpt") || p.includes("openai")) return PRICING.openai;
  if (p.includes("claude") || p.includes("anthropic")) return PRICING.claude;
  if (p.includes("deepseek")) return PRICING.deepseek;
  return PRICING.gemini;
}
