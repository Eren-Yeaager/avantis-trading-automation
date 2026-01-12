import { monitorPriceUntilTrigger } from "../../../utils/price-monitor";
import { TradePage } from "../../../../trades/TradePage";

export async function scenarioLimitOrderTrigger(
  page: any,
  assetPair: string,
  limitPrice: string,
  priceThreshold: number
): Promise<boolean> {
  console.log(`\n=== Scenario: Limit Order Trigger (limit: ${limitPrice}) ===`);
  const tradePage = new TradePage(page);

  await tradePage.selectAssetPair(assetPair);
  await tradePage.selectOrderType("limit");
  await tradePage.fillLimitPrice(limitPrice);
  await tradePage.fillTradeDetails("1", "10");
  await tradePage.placeLongOrder("limit");

  const limitPriceNum = parseFloat(limitPrice);
  const result = await monitorPriceUntilTrigger(
    page,
    assetPair,
    limitPriceNum,
    "above",
    60000
  );

  const orderStatus = await page
    .locator('[data-testid="order-status"]')
    .textContent();

  const success =
    result.triggered && orderStatus?.includes("executed") === true;
  console.log(
    success
      ? `✓ Limit Order Trigger: Executed at ${limitPrice}`
      : `✗ Limit Order Trigger: Failed`
  );
  return success;
}
