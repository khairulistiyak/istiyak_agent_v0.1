export interface AgentMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export class Metrics {
  private metricsList: AgentMetric[] = [];

  public record(name: string, value: number, tags?: Record<string, string>): void {
    this.metricsList.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    });
    console.log(`[Metrics] ${name}: ${value}`, tags || "");
  }

  public getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    for (const metric of this.metricsList) {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, total: 0, avg: 0 };
      }
      summary[metric.name].count++;
      summary[metric.name].total += metric.value;
      summary[metric.name].avg = summary[metric.name].total / summary[metric.name].count;
    }
    return summary;
  }
}
export default Metrics;
