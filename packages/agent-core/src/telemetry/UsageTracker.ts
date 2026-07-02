import fs from "fs";
import path from "path";
import os from "os";

/**
 * Tracks and aggregates LLM usage: tokens, cost, sessions,
 * with daily/weekly/monthly reporting and disk persistence.
 */

export interface UsageRecord {
  timestamp: number;
  date: string;       // YYYY-MM-DD
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  sessionId?: string;
}

/** In-memory usage store */
let usageRecords: UsageRecord[] = [];
const MAX_RECORDS = 10000;

const USAGE_FILE = path.join(os.homedir(), ".istiyak_usage.json");

export class UsageTracker {
  /**
   * Tracks a single LLM usage event.
   */
  static trackUsage(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    sessionId?: string
  ): void {
    const record: UsageRecord = {
      timestamp: Date.now(),
      date: new Date().toISOString().split("T")[0],
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      sessionId,
    };

    usageRecords.push(record);

    // Prune old records
    if (usageRecords.length > MAX_RECORDS) {
      usageRecords = usageRecords.slice(-MAX_RECORDS);
    }
  }

  /**
   * Returns usage aggregated by day.
   */
  static getDailyUsage(days = 7): Array<{
    date: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    callCount: number;
  }> {
    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    const filtered = usageRecords.filter(r => r.timestamp >= cutoff);
    const byDate = new Map<string, UsageRecord[]>();

    for (const record of filtered) {
      const existing = byDate.get(record.date) || [];
      existing.push(record);
      byDate.set(record.date, existing);
    }

    return Array.from(byDate.entries())
      .map(([date, records]) => ({
        date,
        totalInputTokens: records.reduce((sum, r) => sum + r.inputTokens, 0),
        totalOutputTokens: records.reduce((sum, r) => sum + r.outputTokens, 0),
        totalCost: parseFloat(records.reduce((sum, r) => sum + r.cost, 0).toFixed(6)),
        callCount: records.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Returns usage aggregated by provider.
   */
  static getUsageByProvider(): Array<{
    provider: string;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    callCount: number;
  }> {
    const byProvider = new Map<string, UsageRecord[]>();

    for (const record of usageRecords) {
      const existing = byProvider.get(record.provider) || [];
      existing.push(record);
      byProvider.set(record.provider, existing);
    }

    return Array.from(byProvider.entries())
      .map(([provider, records]) => ({
        provider,
        totalInputTokens: records.reduce((sum, r) => sum + r.inputTokens, 0),
        totalOutputTokens: records.reduce((sum, r) => sum + r.outputTokens, 0),
        totalCost: parseFloat(records.reduce((sum, r) => sum + r.cost, 0).toFixed(6)),
        callCount: records.length,
      }));
  }

  /**
   * Returns total usage summary across all time.
   */
  static getTotalUsage() {
    return {
      totalRecords: usageRecords.length,
      totalInputTokens: usageRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: usageRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      totalCost: parseFloat(usageRecords.reduce((sum, r) => sum + r.cost, 0).toFixed(6)),
      oldestRecord: usageRecords.length > 0 ? new Date(usageRecords[0].timestamp).toISOString() : null,
      newestRecord: usageRecords.length > 0 ? new Date(usageRecords[usageRecords.length - 1].timestamp).toISOString() : null,
    };
  }

  /**
   * Persists current usage data to disk.
   */
  static save(): void {
    try {
      fs.writeFileSync(USAGE_FILE, JSON.stringify(usageRecords, null, 2), "utf-8");
    } catch (err: unknown) {
      console.error(`[UsageTracker] Failed to save usage data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Loads usage data from disk.
   */
  static load(): void {
    try {
      if (fs.existsSync(USAGE_FILE)) {
        const data = fs.readFileSync(USAGE_FILE, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          usageRecords = parsed;
        }
      }
    } catch (err: unknown) {
      console.error(`[UsageTracker] Failed to load usage data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /**
   * Clears all usage records.
   */
  static clear(): void {
    usageRecords = [];
  }
}
