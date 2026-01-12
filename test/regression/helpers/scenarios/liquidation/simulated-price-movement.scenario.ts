import { createMarketOrder } from "../../shared-utils";
import {
  getOriginalInvestedAmount,
  ensureAppLaunched,
} from "../../race-condition-utils";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioSimulatedPriceMovement(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  console.log(
    `\n=== Scenario: Simulated Price Movement (Collateral Withdrawal) ===`
  );

  await createMarketOrder(page, assetPair, "2", "10", metamaskConfirmation);

  const initialPositions = await page
    .locator('[data-testid^="position-"]')
    .count();

  if (initialPositions === 0) {
    throw new Error("Failed to create position");
  }

  const startTime = Date.now();

  await page.getByTestId("edit-trade-trigger").first().click();
  await page.waitForTimeout(1000);
  await ensureAppLaunched(page);

  const modalTabs = page.locator('[data-testid="edit-position-header-button"]');
  await modalTabs.first().waitFor({ state: "visible", timeout: 10000 });

  const collateralTab = page
    .locator('[data-testid="edit-position-header-button"]')
    .filter({ hasText: /collateral/i })
    .first();

  await collateralTab.click();
  await page.waitForTimeout(500);

  const withdrawToggleButton = page
    .getByTestId("edit-collateral-deposit-or-withdraw-button")
    .filter({ hasText: /withdraw/i })
    .first();

  await withdrawToggleButton.waitFor({ state: "visible", timeout: 5000 });
  await withdrawToggleButton.click();
  await page.waitForTimeout(500);

  const maxButton = page.getByText("Max").nth(1);

  if (await maxButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log("Clicking 'Max' button to withdraw maximum allowed amount");
    await maxButton.click();
    await page.waitForTimeout(500);

    const confirmButton = page
      .locator('[data-testid="edit-position-header-button"]')
      .filter({ hasText: /edit.*tp.*sl|confirm|save|update/i })
      .or(page.getByRole("button", { name: "Withdraw" }))
      .first();

    if (await confirmButton.isVisible({ timeout: 6000 }).catch(() => false)) {
      await confirmButton.click();

      if (metamaskConfirmation) {
        await page.waitForTimeout(1000);
        await metamaskConfirmation();
        await ensureAppLaunched(page);
      }

      await page.waitForTimeout(5000);

      const finalPositions = await page
        .locator('[data-testid^="position-"]')
        .count();

      const liquidationEvents = await page
        .locator('[data-testid="liquidation-event"]')
        .count();

      const liquidationExecuted = finalPositions < initialPositions;
      const liquidationLatency = Date.now() - startTime;

      const success = liquidationExecuted || liquidationEvents >= 1;

      recordMetrics({
        testName: "Simulated Price Movement",
        assetPair,
        executionLatency: liquidationLatency,
        duplicateExecutions: liquidationEvents > 1 ? liquidationEvents - 1 : 0,
      });

      console.log(
        `  Initial positions: ${initialPositions}, Final positions: ${finalPositions}`
      );
      console.log(`  Liquidation events found: ${liquidationEvents}`);
      console.log(
        success
          ? `✓ Simulated Price Movement: Position liquidated in ${liquidationLatency}ms (events: ${liquidationEvents}, positions: ${initialPositions} → ${finalPositions})`
          : `✗ Simulated Price Movement: Failed (events: ${liquidationEvents}, positions: ${initialPositions} → ${finalPositions})`
      );

      return success;
    } else {
      console.log("✗ Confirm button not found or not visible");
    }
  } else {
    console.log("✗ Max button not found or not visible");
  }

  console.log("✗ Simulated Price Movement: Could not complete scenario");
  console.log("  - Check if collateral tab is accessible");
  console.log("  - Check if withdraw button exists");
  console.log("  - Check if Max button exists");
  console.log("  - Check if confirm button is accessible");
  return false;
}
