import { getCurrentPrice } from "../../../utils/price-monitor";
import { createMarketOrder, ensureAppLaunched } from "../../shared-utils";
import { openEditModal } from "../../race-condition-utils";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioTPSLPriceSpike(
  page: any,
  assetPair: string,
  triggerType: "tp" | "sl"
): Promise<boolean> {
  console.log(
    `\n=== Scenario: ${triggerType.toUpperCase()} Price Spike Through ===`
  );

  await createMarketOrder(page, assetPair, "1", "10");
  await ensureAppLaunched(page);

  await page.waitForTimeout(2000);

  const hasPosition = await page
    .locator('[data-testid^="position-"]')
    .or(page.locator('[data-testid="close-position-trigger"]'))
    .first()
    .isVisible({ timeout: 10000 })
    .catch(() => false);

  if (!hasPosition) {
    console.log(`✗ Position not found after creating order`);
    return false;
  }

  console.log(
    `✓ Order created, now editing to set ${triggerType.toUpperCase()}`
  );

  const currentPrice = await getCurrentPrice(page, assetPair);
  const triggerPrice =
    triggerType === "tp" ? currentPrice * 1.02 : currentPrice * 0.98;

  const { tpSlTab } = await openEditModal(page);
  await tpSlTab.click();
  await page.waitForTimeout(500);

  const inputTestId = triggerType === "tp" ? "edit-tp-input" : "edit-sl-input";
  const input = page.getByTestId(inputTestId).first();
  await input.waitFor({ state: "visible", timeout: 5000 });
  await input.clear();
  await input.fill(triggerPrice.toFixed(2));
  await page.waitForTimeout(500);

  const confirmButton = page
    .locator('[data-testid="edit-position-header-button"]')
    .filter({ hasText: /edit.*tp.*sl|confirm|save|update/i })
    .or(page.getByRole("button", { name: /edit.*tp.*sl|confirm|save|update/i }))
    .first();

  if (!(await confirmButton.isVisible({ timeout: 5000 }).catch(() => false))) {
    console.log(`✗ Confirm button not found for ${triggerType.toUpperCase()}`);
    return false;
  }

  await confirmButton.click();
  await page.waitForTimeout(2000);
  await ensureAppLaunched(page);

  const { tpSlTab: verifyTab } = await openEditModal(page);
  await verifyTab.click();
  await page.waitForTimeout(500);

  const verifyInput = page.getByTestId(inputTestId).first();
  await verifyInput.waitFor({ state: "visible", timeout: 5000 });
  const actualValue = await verifyInput.inputValue().catch(() => null);

  const setupSuccess =
    actualValue === triggerPrice.toFixed(2) ||
    Math.abs(parseFloat(actualValue || "0") - triggerPrice) < 0.01;

  if (setupSuccess) {
    console.log(
      `✓ ${triggerType.toUpperCase()} verified: Set to ${actualValue} (target: ${triggerPrice.toFixed(
        2
      )})`
    );
  } else {
    console.log(
      `✗ ${triggerType.toUpperCase()} verification failed. Expected: ${triggerPrice.toFixed(
        2
      )}, Got: ${actualValue}`
    );
  }

  return setupSuccess;

  recordMetrics({
    testName: `${triggerType.toUpperCase()} Price Spike`,
    assetPair,
    executionPrice: triggerPrice,
    oraclePrice: currentPrice,
  });

  return setupSuccess;
}
