export class TokenCounter {
  /**
   * Safe token counter fallback.
   * Standard estimation logic: 1 token ~ 4 characters for English text.
   */
  public static countTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  public static estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Estimator utility
    const pricingMap: Record<string, { in: number; out: number }> = {
      "gemini-2.5-flash": { in: 0.075, out: 0.30 },
      "gemini-1.5-pro": { in: 1.25, out: 5.00 },
      "claude-3.5-sonnet": { in: 3.00, out: 15.00 },
      "gpt-4o": { in: 5.00, out: 15.00 }
    };
    const pricing = pricingMap[model] || pricingMap["gemini-2.5-flash"];
    return ((inputTokens / 1_000_000) * pricing.in) + ((outputTokens / 1_000_000) * pricing.out);
  }
}
export default TokenCounter;
