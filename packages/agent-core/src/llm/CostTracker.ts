export class CostTracker {
  // Price per 1M tokens based on standard pricing models
  private pricing: Record<string, { in: number; out: number }> = {
    "gemini-2.5-flash": { in: 0.075, out: 0.30 },
    "gemini-1.5-pro": { in: 1.25, out: 5.00 },
    "claude-3.5-sonnet": { in: 3.00, out: 15.00 },
    "gpt-4o": { in: 5.00, out: 15.00 }
  };

  public calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const rate = this.pricing[model] || this.pricing["gemini-2.5-flash"];
    const inputCost = (inputTokens / 1_000_000) * rate.in;
    const outputCost = (outputTokens / 1_000_000) * rate.out;
    return inputCost + outputCost;
  }
}
