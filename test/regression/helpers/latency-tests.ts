import { scenarioMarketOpenLatency } from "./scenarios/latency/market-open-latency.scenario";
import { scenarioMarketCloseLatency } from "./scenarios/latency/market-close-latency.scenario";
import { scenarioOrderPlacementLatencyAtMarketOpen } from "./scenarios/latency/order-placement-open.scenario";
import { scenarioOrderPlacementLatencyAtMarketClose } from "./scenarios/latency/order-placement-close.scenario";

export async function testMarketOpenLatency(
  page: any,
  maxLatency: number
): Promise<number> {
  return await scenarioMarketOpenLatency(page, maxLatency);
}

export async function testMarketCloseLatency(
  page: any,
  maxLatency: number
): Promise<number> {
  return await scenarioMarketCloseLatency(page, maxLatency);
}

export async function testOrderPlacementLatencyAtMarketOpen(
  page: any,
  assetPair: string,
  maxLatency: number,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  return await scenarioOrderPlacementLatencyAtMarketOpen(
    page,
    assetPair,
    maxLatency,
    collateral,
    leverage,
    metamaskConfirmation
  );
}

export async function testOrderPlacementLatencyAtMarketClose(
  page: any,
  assetPair: string,
  maxLatency: number,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  return await scenarioOrderPlacementLatencyAtMarketClose(
    page,
    assetPair,
    maxLatency,
    collateral,
    leverage,
    metamaskConfirmation
  );
}
