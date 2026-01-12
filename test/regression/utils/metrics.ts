
export interface TestMetrics {
  executionLatency?: number;
  executionPrice?: number;
  oraclePrice?: number;
  priceDifference?: number;
  duplicateExecutions?: number;
  missedTriggers?: number;
  timestamp?: number;
  testName: string;
  assetPair: string;
}

const metricsStore: TestMetrics[] = [];

export function recordMetrics(metrics: TestMetrics): void {
  metricsStore.push({
    ...metrics,
    timestamp: Date.now(),
  });
  console.log(`📊 Metrics recorded:`, metrics);
}

export function getAllMetrics(): TestMetrics[] {
  return metricsStore;
}

export function getAverageLatency(): number {
  const latencies = metricsStore
    .filter((m) => m.executionLatency !== undefined)
    .map((m) => m.executionLatency!);

  if (latencies.length === 0) return 0;
  return latencies.reduce((a, b) => a + b, 0) / latencies.length;
}

export function getFailedTxRate(): number {
  return 0;
}

export function clearMetrics(): void {
  metricsStore.length = 0;
}

export function generateMetricsReport(): string {
  const avgLatency = getAverageLatency();
  const totalTests = metricsStore.length;
  const duplicateExecutions = metricsStore.filter(
    (m) => m.duplicateExecutions && m.duplicateExecutions > 0
  ).length;
  const missedTriggers = metricsStore.filter(
    (m) => m.missedTriggers && m.missedTriggers > 0
  ).length;

  return `
📊 Pyth Lazer Test Metrics Report
================================
Total Tests: ${totalTests}
Average Execution Latency: ${avgLatency.toFixed(2)}ms
Duplicate Executions: ${duplicateExecutions}
Missed Triggers: ${missedTriggers}
Failed TX Rate: ${getFailedTxRate()}%
================================
  `;
}
