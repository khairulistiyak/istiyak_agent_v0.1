// Model pricing structure per 1,000,000 tokens (in USD)
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

/**
 * Estimates token count based on standard word/character count heuristic.
 * 1 token is roughly 4 characters or 0.75 words.
 * @param {string} text 
 * @returns {number} estimated tokens
 */
export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Calculates the cost of a request and response pair.
 * @param {string} provider - 'gemini' | 'openai' | 'claude'
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {number} Calculated cost in USD
 */
export function calculateCost(provider, inputTokens, outputTokens) {
  const p = provider.toLowerCase();
  const pricingRule = getPricingRule(p);

  const inputCost = (inputTokens / 1_000_000) * pricingRule.input;
  const outputCost = (outputTokens / 1_000_000) * pricingRule.output;

  return inputCost + outputCost;
}

function getPricingRule(provider) {
  if (provider.includes("gemini")) return PRICING.gemini;
  if (provider.includes("gpt") || provider.includes("openai")) return PRICING.openai;
  if (provider.includes("claude") || provider.includes("anthropic")) return PRICING.claude;
  return PRICING.gemini; // Default fallback
}
