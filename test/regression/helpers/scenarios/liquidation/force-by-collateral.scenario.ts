import { createMarketOrder } from "../../shared-utils";
import {
  getOriginalInvestedAmount,
  ensureAppLaunched,
} from "../../race-condition-utils";
import { recordMetrics } from "../../../utils/metrics";

export async function scenarioForceLiquidationByCollateral(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  console.log(
    `\n=== Scenario: Force Liquidation by Withdrawing Collateral ===`
  );

  await createMarketOrder(page, assetPair, "2", "10", metamaskConfirmation);

  const initialPositions = await page
    .locator('[data-testid^="position-"]')
    .count();

  if (initialPositions === 0) {
    throw new Error("Failed to create position");
  }

  const currentInvested = await getOriginalInvestedAmount(page);
  console.log(`Current invested: ${currentInvested}`);

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

  try {
    const maxButton = page.getByText("Max").nth(1);

    if (await maxButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log("Clicking 'Max' button to withdraw maximum allowed amount");
      await maxButton.click();
      await page.waitForTimeout(500);

      const confirmButton = page
        .locator('[data-testid="edit-position-header-button"]')
        .filter({ hasText: /edit.*tp.*sl|confirm|save|update/i })
        .or(
          page.getByRole("button", {
            name: /edit.*tp.*sl|confirm|save|update/i,
          })
        )
        .first();

      if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
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

        const success = liquidationExecuted || liquidationEvents >= 1;

        recordMetrics({
          testName: "Force Liquidation by Collateral",
          assetPair,
          duplicateExecutions:
            liquidationEvents > 1 ? liquidationEvents - 1 : 0,
        });

        console.log(
          `  Initial positions: ${initialPositions}, Final positions: ${finalPositions}`
        );
        console.log(`  Liquidation events found: ${liquidationEvents}`);
        console.log(
          success
            ? `✓ Force Liquidation by Collateral: Position liquidated (events: ${liquidationEvents}, positions: ${initialPositions} → ${finalPositions})`
            : `✗ Force Liquidation by Collateral: Failed (events: ${liquidationEvents}, positions: ${initialPositions} → ${finalPositions})`
        );

        return success;
      } else {
        console.log("✗ Confirm button not found or not visible");
      }
    } else {
      console.log("✗ Max button not found or not visible");
    }
  } catch (e) {
    console.log("✗ Collateral withdrawal failed:", e);
  }

  console.log("✗ Force Liquidation by Collateral: Could not complete scenario");
  console.log("  - Check if withdraw button exists in collateral tab");
  console.log("  - Check if Max button exists");
  console.log("  - Check if confirm button is accessible");
  return false;
}
