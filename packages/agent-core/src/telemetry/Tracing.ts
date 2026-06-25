export interface Span {
  name: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
}

export class Tracing {
  private spans: Map<string, Span> = new Map();

  public startSpan(name: string): void {
    this.spans.set(name, {
      name,
      startTime: Date.now()
    });
  }

  public endSpan(name: string): void {
    const span = this.spans.get(name);
    if (span) {
      span.endTime = Date.now();
      span.durationMs = span.endTime - span.startTime;
      console.log(`[Trace] Span '${name}' completed in ${span.durationMs}ms`);
    }
  }

  public getSpan(name: string): Span | undefined {
    return this.spans.get(name);
  }
}
