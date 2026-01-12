import { monitorPriceUntilTrigger } from "../../../utils/price-monitor";
import { createMarketOrder } from "../../shared-utils";

export async function scenarioStopLossTrigger(
  page: any,
  assetPair: string,
  stopLossPrice: string,
  priceThreshold: number
): Promise<boolean> {
  console.log(`\n=== Scenario: Stop Loss Trigger (stop: ${stopLossPrice}) ===`);

  await createMarketOrder(page, assetPair, "1", "10");

  const slInput = page.getByTestId("stop-loss-input");
  await slInput.fill(stopLossPrice);

  const slPriceNum = parseFloat(stopLossPrice);
  const result = await monitorPriceUntilTrigger(
    page,
    assetPair,
    slPriceNum,
    "below",
    120000
  );

  const success = result.triggered;
  console.log(
    success
      ? `✓ Stop Loss Trigger: Executed at ${stopLossPrice}`
      : `✗ Stop Loss Trigger: Failed`
  );
  return success;
}
