const PRICING = {
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
};

export function calculateCost(provider: string, inputTokens: number, outputTokens: number): number {
  const p = provider.toLowerCase();
  const pricingRule = getPricingRule(p);

  const inputCost = (inputTokens / 1_000_000) * pricingRule.input;
  const outputCost = (outputTokens / 1_000_000) * pricingRule.output;

  return inputCost + outputCost;
}

function getPricingRule(provider: string) {
  const p = provider.toLowerCase();
  if (p.includes("ollama") || p.includes("custom")) {
    return { input: 0, output: 0 };
  }
  if (p.includes("gemini")) return PRICING.gemini;
  if (p.includes("gpt") || p.includes("openai")) return PRICING.openai;
  if (p.includes("claude") || p.includes("anthropic")) return PRICING.claude;
  return PRICING.gemini;
}
