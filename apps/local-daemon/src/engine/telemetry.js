// Simple in-memory storage for telemetry events
const MAX_METRICS_LOGS = 50;
let metricsLogs = [];

/**
 * Record a telemetry metric.
 * @param {string} provider
 * @param {string} model
 * @param {number} latencyMs
 * @param {number} tokensIn
 * @param {number} tokensOut
 */
export function recordMetric(provider, model, latencyMs, tokensIn, tokensOut) {
  const totalTokens = tokensIn + tokensOut;
  const tokensPerSec = latencyMs > 0 ? (tokensOut / (latencyMs / 1000)) : 0;
  
  const metric = {
    timestamp: new Date().toLocaleTimeString(),
    provider,
    model,
    latencyMs,
    tokensIn,
    tokensOut,
    totalTokens,
    tokensPerSec: parseFloat(tokensPerSec.toFixed(2))
  };

  metricsLogs.push(metric);
  if (metricsLogs.length > MAX_METRICS_LOGS) {
    metricsLogs.shift();
  }

  console.log(`[Telemetry] Recorded metric: ${provider}/${model} - Latency: ${latencyMs}ms, Speed: ${metric.tokensPerSec} t/s`);
  return metric;
}

/**
 * Aggregate telemetry metrics logs.
 * @returns {Object} statistics report
 */
export function getStats() {
  if (metricsLogs.length === 0) {
    return {
      callCount: 0,
      avgLatencyMs: 0,
      avgSpeed: 0,
      totalTokensIn: 0,
      totalTokensOut: 0,
      history: []
    };
  }

  const sumLatency = metricsLogs.reduce((acc, m) => acc + m.latencyMs, 0);
  const sumSpeed = metricsLogs.reduce((acc, m) => acc + m.tokensPerSec, 0);
  const totalTokensIn = metricsLogs.reduce((acc, m) => acc + m.tokensIn, 0);
  const totalTokensOut = metricsLogs.reduce((acc, m) => acc + m.tokensOut, 0);

  return {
    callCount: metricsLogs.length,
    avgLatencyMs: Math.round(sumLatency / metricsLogs.length),
    avgSpeed: parseFloat((sumSpeed / metricsLogs.length).toFixed(2)),
    totalTokensIn,
    totalTokensOut,
    history: metricsLogs
  };
}
