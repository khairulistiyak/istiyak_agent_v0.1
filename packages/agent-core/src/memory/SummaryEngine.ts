export class SummaryEngine {
  static summarize(text: string): string {
    return `Summary of: ${text.substring(0, 100)}...`;
  }
}
