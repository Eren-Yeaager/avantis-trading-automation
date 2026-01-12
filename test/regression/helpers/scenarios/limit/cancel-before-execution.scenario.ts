import { TradePage } from "../../../../trades/TradePage";
import { getCurrentPrice } from "../../../utils/price-monitor";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioCancelLimitBeforeExecution(
  page: any,
  assetPair: string
): Promise<boolean> {
  console.log(`\n=== Scenario: Cancel Limit Order Before Execution ===`);

  const tradePage = new TradePage(page);
  const currentPrice = await getCurrentPrice(page, assetPair);
  const limitPrice = currentPrice * 1.05;

  await tradePage.selectAssetPair(assetPair);
  await tradePage.selectOrderType("limit");
  await tradePage.fillLimitPrice(limitPrice.toFixed(2));
  await tradePage.fillTradeDetails("1", "10");
  await tradePage.placeLongOrder("limit");

  await page.waitForTimeout(2000);

  const cancelButton = page.getByRole("button", { name: /cancel/i }).first();

  const cancelStartTime = Date.now();
  await cancelButton.waitFor({ state: "visible", timeout: 10000 });
  await cancelButton.click();
  await page.waitForTimeout(2000);
  const cancelLatency = Date.now() - cancelStartTime;

  const activeOrders = await page.locator('[data-testid^="order-"]').count();

  const success = activeOrders === 0;

  recordMetrics({
    testName: "Cancel Limit Before Execution",
    assetPair,
    executionLatency: cancelLatency,
    executionPrice: limitPrice,
    oraclePrice: currentPrice,
  });

  console.log(
    success
      ? `✓ Cancel Limit Before Execution: Cancelled in ${cancelLatency}ms`
      : `✗ Cancel Limit Before Execution: Failed`
  );

  return success;
}
