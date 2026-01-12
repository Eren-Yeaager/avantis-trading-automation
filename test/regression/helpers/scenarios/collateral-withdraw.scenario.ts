import {
  setAndVerifyInput,
  ensureEditModalOpen,
  ensureAppLaunched,
  getOriginalInvestedAmount,
} from "../race-condition-utils";

export async function scenarioCollateralWithdraw(
  page: any,
  collateralTab: any,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  try {
    await ensureEditModalOpen(page);
    await collateralTab.click();
    await page.waitForTimeout(500);

    const withdrawToggleButton = page
      .getByTestId("edit-collateral-deposit-or-withdraw-button")
      .filter({ hasText: /withdraw/i })
      .first();

    const toggleButton = page
      .getByTestId("edit-collateral-deposit-or-withdraw-button")
      .first();
    await toggleButton.waitFor({ state: "visible", timeout: 5000 });
    const currentText = await toggleButton.textContent();
    if (currentText?.toLowerCase().includes("deposit")) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    const withdrawInput = page.getByTestId("edit-collateral-input").first();

    if (await withdrawInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const currentInvested = await getOriginalInvestedAmount(page);
      const withdrawAmount = "0.3";

      await withdrawInput.clear();
      await withdrawInput.fill(withdrawAmount);
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
        }

        await page.waitForTimeout(2000);

        await ensureAppLaunched(page);

        const newInvested = await getOriginalInvestedAmount(page);
        const expectedInvested = currentInvested - parseFloat(withdrawAmount);
        const withdrawVerified =
          Math.abs(newInvested - expectedInvested) < 0.01;

        if (withdrawVerified) {
          console.log(
            `✓ Withdraw verified: ${currentInvested} - ${withdrawAmount} = ${newInvested}`
          );
          return true;
        } else {
          console.log(
            `✗ Withdraw verification failed: Expected ~${expectedInvested}, Got ${newInvested}`
          );
          return false;
        }
      }

      return false;
    } else {
      console.log("Withdraw input not found, skipping");
      return false;
    }
  } catch (e) {
    console.log("Collateral Withdraw scenario failed:", e);
    return false;
  }
}
