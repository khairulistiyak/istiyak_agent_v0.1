export class UsageTracker {
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;

  public trackUsage(input: number, output: number): void {
    this.totalInputTokens += input;
    this.totalOutputTokens += output;
  }

  public getUsage(): { inputTokens: number; outputTokens: number; totalTokens: number } {
    return {
      inputTokens: this.totalInputTokens,
      outputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens
    };
  }

  public clear(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
  }
}
