import {
  measureMarketOpenLatency,
  assertLatencyWithinThreshold,
} from "../../../utils/performance";

export async function scenarioMarketOpenLatency(
  page: any,
  maxLatency: number
): Promise<number> {
  console.log(`\n=== Scenario: Market Open Latency (max: ${maxLatency}ms) ===`);
  const latency = await measureMarketOpenLatency(page);
  assertLatencyWithinThreshold(latency, maxLatency, "Market Open Latency");
  console.log(`✓ Market Open Latency: ${latency}ms`);
  return latency;
}
