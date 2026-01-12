import {
  setAndVerifyInput,
  ensureEditModalOpen,
  ensureAppLaunched,
  getOriginalInvestedAmount,
} from "../race-condition-utils";

export async function scenarioCollateralDeposit(
  page: any,
  collateralTab: any,
  originalInvested: number,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  try {
    await ensureEditModalOpen(page);
    await collateralTab.click();
    await page.waitForTimeout(500);

    const depositToggleButton = page
      .getByTestId("edit-collateral-deposit-or-withdraw-button")
      .filter({ hasText: /deposit/i })
      .first();

    const isDepositMode = await depositToggleButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    if (!isDepositMode) {
      const toggleButton = page
        .getByTestId("edit-collateral-deposit-or-withdraw-button")
        .first();
      await toggleButton.waitFor({ state: "visible", timeout: 5000 });
      const currentText = await toggleButton.textContent();
      if (currentText?.toLowerCase().includes("withdraw")) {
        await toggleButton.click();
        await page.waitForTimeout(500);
      }
    }

    const depositInput = page.getByTestId("edit-collateral-input").first();

    if (await depositInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      const depositAmount = "0.5";

      await depositInput.clear();
      await depositInput.fill(depositAmount);
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
        const expectedInvested = originalInvested + parseFloat(depositAmount);
        const depositVerified = Math.abs(newInvested - expectedInvested) < 0.01;

        if (depositVerified) {
          console.log(
            `✓ Deposit verified: ${originalInvested} + ${depositAmount} = ${newInvested}`
          );
          return true;
        } else {
          console.log(
            `✗ Deposit verification failed: Expected ~${expectedInvested}, Got ${newInvested}`
          );
          return false;
        }
      }

      return false;
    } else {
      console.log("Deposit input not found, skipping");
      return false;
    }
  } catch (e) {
    console.log("Collateral Deposit scenario failed:", e);
    return false;
  }
}
