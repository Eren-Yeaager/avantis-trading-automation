import { getCurrentPrice } from "../../../utils/price-monitor";
import { createMarketOrder, ensureAppLaunched } from "../../shared-utils";
import { openEditModal } from "../../race-condition-utils";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioEditTPSLNearTrigger(
  page: any,
  assetPair: string,
  triggerType: "tp" | "sl"
): Promise<boolean> {
  console.log(
    `\n=== Scenario: Edit ${triggerType.toUpperCase()} Near Trigger ===`
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
  const initialTriggerPrice =
    triggerType === "tp" ? currentPrice * 1.01 : currentPrice * 0.99;

  const { tpSlTab } = await openEditModal(page);
  await tpSlTab.click();
  await page.waitForTimeout(500);

  const inputTestId = triggerType === "tp" ? "edit-tp-input" : "edit-sl-input";
  const input = page.getByTestId(inputTestId).first();
  await input.waitFor({ state: "visible", timeout: 5000 });

  await input.clear();
  await input.fill(initialTriggerPrice.toFixed(2));
  await page.waitForTimeout(500);

  const editedTriggerPrice =
    triggerType === "tp" ? currentPrice * 1.015 : currentPrice * 0.985;

  await input.clear();
  await input.fill(editedTriggerPrice.toFixed(2));
  await page.waitForTimeout(500);

  const finalTriggerPrice =
    triggerType === "tp" ? currentPrice * 1.02 : currentPrice * 0.98;

  await input.clear();
  await input.fill(finalTriggerPrice.toFixed(2));
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
    actualValue === finalTriggerPrice.toFixed(2) ||
    Math.abs(parseFloat(actualValue || "0") - finalTriggerPrice) < 0.01;

  if (setupSuccess) {
    console.log(
      `✓ ${triggerType.toUpperCase()} edited and verified: Set to ${actualValue} (target: ${finalTriggerPrice.toFixed(
        2
      )})`
    );
  } else {
    console.log(
      `✗ ${triggerType.toUpperCase()} verification failed. Expected: ${finalTriggerPrice.toFixed(
        2
      )}, Got: ${actualValue}`
    );
  }

  return setupSuccess;

  recordMetrics({
    testName: `Edit ${triggerType.toUpperCase()} Near Trigger`,
    assetPair,
    executionPrice: finalTriggerPrice,
    oraclePrice: currentPrice,
  });

  return setupSuccess;
}
