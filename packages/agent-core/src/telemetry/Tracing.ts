/**
 * Lightweight tracing system with nested span support,
 * timing, logging, and hierarchical trace tree output.
 */

export interface Span {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  logs: Array<{ timestamp: number; message: string }>;
  children: Span[];
  status: "running" | "completed" | "error";
  error?: string;
  end: () => void;
  log: (message: string) => void;
  startChild: (name: string) => Span;
}

/** Global span storage for the current trace */
let activeSpans: Span[] = [];
let completedSpans: Span[] = [];
const MAX_COMPLETED_SPANS = 200;

export class Tracing {
  /**
   * Starts a new top-level span.
   */
  static startSpan(name: string): Span {
    return Tracing.createSpan(name);
  }

  /**
   * Creates a span object with timing, logging, and child span support.
   */
  private static createSpan(name: string): Span {
    const span: Span = {
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      logs: [],
      children: [],
      status: "running",
      error: undefined,

      end() {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = span.error ? "error" : "completed";

        // Move from active to completed
        activeSpans = activeSpans.filter(s => s !== span);
        completedSpans.push(span);

        // Prune old spans
        while (completedSpans.length > MAX_COMPLETED_SPANS) {
          completedSpans.shift();
        }
      },

      log(message: string) {
        span.logs.push({
          timestamp: Date.now(),
          message,
        });
      },

      startChild(childName: string) {
        const child = Tracing.createSpan(childName);
        span.children.push(child);
        return child;
      },
    };

    activeSpans.push(span);
    return span;
  }

  /**
   * Returns all currently active (running) spans.
   */
  static getActiveSpans(): Span[] {
    return [...activeSpans];
  }

  /**
   * Returns the most recent completed spans.
   */
  static getCompletedSpans(count = 20): Span[] {
    return completedSpans.slice(-count);
  }

  /**
   * Returns a formatted trace tree string for debugging.
   */
  static formatTraceTree(span: Span, indent = 0): string {
    const prefix = "  ".repeat(indent);
    const statusIcon = span.status === "completed" ? "✓" :
                       span.status === "error" ? "✗" : "⏳";
    const duration = span.duration > 0 ? `${span.duration}ms` : "running...";

    let output = `${prefix}${statusIcon} ${span.name} (${duration})`;

    if (span.error) {
      output += `\n${prefix}  ⚠ Error: ${span.error}`;
    }

    for (const log of span.logs) {
      const time = new Date(log.timestamp).toLocaleTimeString();
      output += `\n${prefix}  📝 [${time}] ${log.message}`;
    }

    for (const child of span.children) {
      output += "\n" + Tracing.formatTraceTree(child, indent + 1);
    }

    return output;
  }

  /**
   * Clears all span history.
   */
  static clear(): void {
    activeSpans = [];
    completedSpans = [];
  }

  /**
   * Returns tracing statistics.
   */
  static getStats() {
    const allSpans = [...completedSpans];
    const totalDuration = allSpans.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = allSpans.length > 0 ? Math.round(totalDuration / allSpans.length) : 0;
    const errorCount = allSpans.filter(s => s.status === "error").length;

    return {
      activeCount: activeSpans.length,
      completedCount: completedSpans.length,
      totalDurationMs: totalDuration,
      avgDurationMs: avgDuration,
      errorCount,
    };
  }
}
