import {
  measureMarketCloseLatency,
  assertLatencyWithinThreshold,
} from "../../../utils/performance";

export async function scenarioMarketCloseLatency(
  page: any,
  maxLatency: number
): Promise<number> {
  console.log(
    `\n=== Scenario: Market Close Latency (max: ${maxLatency}ms) ===`
  );
  const latency = await measureMarketCloseLatency(page);
  assertLatencyWithinThreshold(latency, maxLatency, "Market Close Latency");
  console.log(`✓ Market Close Latency: ${latency}ms`);
  return latency;
}
