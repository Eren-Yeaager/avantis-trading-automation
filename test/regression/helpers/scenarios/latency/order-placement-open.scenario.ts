import {
  measureOrderPlacementLatencyAtMarketOpen,
  assertLatencyWithinThreshold,
} from "../../../utils/performance";

export async function scenarioOrderPlacementLatencyAtMarketOpen(
  page: any,
  assetPair: string,
  maxLatency: number,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  console.log(
    `\n=== Scenario: Order Placement Latency at Market Open (max: ${maxLatency}ms) ===`
  );
  const latency = await measureOrderPlacementLatencyAtMarketOpen(
    page,
    assetPair,
    collateral,
    leverage,
    metamaskConfirmation
  );
  assertLatencyWithinThreshold(
    latency,
    maxLatency,
    "Order Placement Latency at Market Open"
  );
  console.log(`✓ Order Placement Latency at Market Open: ${latency}ms`);
  return latency;
}
