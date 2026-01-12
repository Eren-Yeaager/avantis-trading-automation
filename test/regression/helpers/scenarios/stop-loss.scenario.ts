import {
  setAndVerifyInput,
  ensureEditModalOpen,
} from "../race-condition-utils";

export async function scenarioStopLoss(
  page: any,
  tpSlTab: any
): Promise<boolean> {
  try {
    await ensureEditModalOpen(page);
    await tpSlTab.click();
    await page.waitForTimeout(500);

    const stopLossValue = "0.5";
    const slSet = await setAndVerifyInput(
      page,
      "edit-sl-input",
      stopLossValue,
      "Stop Loss"
    );

    const slGeInput = page.locator('[data-testid="edit-sl-ge-input"]').first();
    if (await slGeInput.isVisible().catch(() => false)) {
      await slGeInput.click();
      await page.waitForTimeout(200);
    }

    return slSet;
  } catch (e) {
    console.log("Stop Loss scenario failed:", e);
    return false;
  }
}
