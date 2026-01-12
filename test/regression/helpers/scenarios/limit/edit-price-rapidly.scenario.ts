import { TradePage } from "../../../../trades/TradePage";
import { getCurrentPrice } from "../../../utils/price-monitor";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioEditLimitPriceRapidly(
  page: any,
  assetPair: string
): Promise<boolean> {
  console.log(`\n=== Scenario: Edit Limit Price Rapidly ===`);

  const tradePage = new TradePage(page);
  const currentPrice = await getCurrentPrice(page, assetPair);
  const initialLimitPrice = currentPrice * 1.05;

  await tradePage.selectAssetPair(assetPair);
  await tradePage.selectOrderType("limit");
  await tradePage.fillLimitPrice(initialLimitPrice.toFixed(2));
  await tradePage.fillTradeDetails("1", "10");
  await tradePage.placeLongOrder("limit");

  await page.waitForTimeout(1000);

  const editButton = page.getByRole("button", { name: /edit/i }).first();

  await editButton.waitFor({ state: "visible", timeout: 10000 });
  await editButton.click();
  await page.waitForTimeout(500);

  const limitPriceInput = page.getByTestId("limit-price-input");

  const price1 = (currentPrice * 1.06).toFixed(2);
  await limitPriceInput.clear();
  await limitPriceInput.fill(price1);
  await page.waitForTimeout(200);

  const price2 = (currentPrice * 1.07).toFixed(2);
  await limitPriceInput.clear();
  await limitPriceInput.fill(price2);
  await page.waitForTimeout(200);

  const finalPrice = (currentPrice * 1.08).toFixed(2);
  await limitPriceInput.clear();
  await limitPriceInput.fill(finalPrice);

  const confirmButton = page
    .getByRole("button", { name: /confirm|save/i })
    .first();
  await confirmButton.click();
  await page.waitForTimeout(2000);

  const orderPrice = await page
    .locator('[data-testid="order-price"]')
    .first()
    .textContent()
    .catch(() => null);

  const success = orderPrice?.includes(finalPrice) || false;

  recordMetrics({
    testName: "Edit Limit Price Rapidly",
    assetPair,
    executionPrice: parseFloat(finalPrice),
    oraclePrice: currentPrice,
  });

  console.log(
    success
      ? `✓ Edit Limit Price Rapidly: Updated to ${finalPrice}`
      : `✗ Edit Limit Price Rapidly: Failed`
  );

  return success;
}
