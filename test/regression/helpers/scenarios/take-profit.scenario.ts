import {
  setAndVerifyInput,
  ensureEditModalOpen,
} from "../race-condition-utils";

export async function scenarioTakeProfit(
  page: any,
  tpSlTab: any
): Promise<boolean> {
  try {
    await ensureEditModalOpen(page);
    await tpSlTab.click();
    await page.waitForTimeout(500);

    const tpInput = page
      .locator('[data-testid="edit-tp-input"]')
      .or(page.locator('[data-testid*="tp-input"]'))
      .or(page.locator('[data-testid*="take-profit"]'))
      .first();

    if (await tpInput.isVisible().catch(() => false)) {
      const takeProfitValue = "2.0";
      let tpSet = await setAndVerifyInput(
        page,
        "edit-tp-input",
        takeProfitValue,
        "Take Profit",
        false
      );

      if (!tpSet) {
        tpSet = await setAndVerifyInput(
          page,
          "tp-input",
          takeProfitValue,
          "Take Profit",
          true
        );
      }

      return tpSet;
    } else {
      console.log("Take Profit input not found, skipping");
      return false;
    }
  } catch (e) {
    console.log("Take Profit scenario failed:", e);
    return false;
  }
}
