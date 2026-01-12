import { createMarketOrder } from "../../shared-utils";
import { getCurrentPrice } from "../../../utils/price-monitor";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioMarketImmediateClose(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  console.log(`\n=== Scenario: Market Open → Close Immediately ===`);

  const startTime = Date.now();

  await createMarketOrder(page, assetPair, "1", "10", metamaskConfirmation);
  const openLatency = Date.now() - startTime;

  const executionPrice = await getCurrentPrice(page, assetPair);

  await page.waitForTimeout(1000);

  const closeStartTime = Date.now();
  const closeButton = page.getByTestId("close-position-trigger").first();

  await closeButton.waitFor({ state: "visible", timeout: 10000 });
  await closeButton.scrollIntoViewIfNeeded();
  await closeButton.click();

  const confirmButton = page.getByTestId("confirm-trade-button");
  await confirmButton.waitFor({ state: "visible", timeout: 10000 });
  await confirmButton.click();

  if (metamaskConfirmation) {
    await page.waitForTimeout(1000);
    await metamaskConfirmation();
  }

  await page.waitForTimeout(3000);
  const closeLatency = Date.now() - closeStartTime;
  const totalLatency = Date.now() - startTime;

  const positions = await page.locator('[data-testid^="position-"]').count();

  const success = positions === 0;

  recordMetrics({
    testName: "Market Immediate Close",
    assetPair,
    executionLatency: totalLatency,
    executionPrice,
    duplicateExecutions: 0,
  });

  console.log(
    success
      ? `✓ Market Immediate Close: ${totalLatency}ms (open: ${openLatency}ms, close: ${closeLatency}ms)`
      : `✗ Market Immediate Close: Failed`
  );

  return success;
}
