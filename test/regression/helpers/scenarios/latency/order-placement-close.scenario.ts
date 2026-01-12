import {
  measureOrderPlacementLatencyAtMarketClose,
  assertLatencyWithinThreshold,
} from "../../../utils/performance";

export async function scenarioOrderPlacementLatencyAtMarketClose(
  page: any,
  assetPair: string,
  maxLatency: number,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  console.log(
    `\n=== Scenario: Position Closure Latency at Market Close (max: ${maxLatency}ms) ===`
  );
  const latency = await measureOrderPlacementLatencyAtMarketClose(
    page,
    assetPair,
    collateral,
    leverage,
    metamaskConfirmation
  );
  assertLatencyWithinThreshold(
    latency,
    maxLatency,
    "Position Closure Latency at Market Close"
  );
  console.log(`✓ Position Closure Latency at Market Close: ${latency}ms`);
  return latency;
}
