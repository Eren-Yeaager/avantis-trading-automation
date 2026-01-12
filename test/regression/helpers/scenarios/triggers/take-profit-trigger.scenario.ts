import { monitorPriceUntilTrigger } from "../../../utils/price-monitor";
import { createMarketOrder } from "../../shared-utils";

export async function scenarioTakeProfitTrigger(
  page: any,
  assetPair: string,
  takeProfitPrice: string,
  priceThreshold: number
): Promise<boolean> {
  console.log(
    `\n=== Scenario: Take Profit Trigger (target: ${takeProfitPrice}) ===`
  );

  await createMarketOrder(page, assetPair, "1", "10");

  const tpInput = page.getByTestId("take-profit-input");
  await tpInput.fill(takeProfitPrice);

  const tpPriceNum = parseFloat(takeProfitPrice);
  const result = await monitorPriceUntilTrigger(
    page,
    assetPair,
    tpPriceNum,
    "above",
    120000
  );

  const success = result.triggered;
  console.log(
    success
      ? `✓ Take Profit Trigger: Executed at ${takeProfitPrice}`
      : `✗ Take Profit Trigger: Failed`
  );
  return success;
}
