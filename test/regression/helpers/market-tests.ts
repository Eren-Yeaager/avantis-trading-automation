import { scenarioMarketImmediateClose } from "./scenarios/market/immediate-close.scenario";

export async function testMarketImmediateClose(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  return await scenarioMarketImmediateClose(
    page,
    assetPair,
    metamaskConfirmation
  );
}
