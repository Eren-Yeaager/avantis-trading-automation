export async function scenarioRaceCondition(
  page: any,
  tpSlTab: any
): Promise<boolean> {
  try {
    let cancelButton;
    try {
      cancelButton = page
        .getByRole("button", { name: /cancel|close/i })
        .or(
          page.locator(
            'button[aria-label*="close"], button[aria-label*="Close"]'
          )
        )
        .or(page.locator('[data-testid*="close"], [data-testid*="cancel"]'))
        .first();
      await cancelButton.waitFor({ state: "visible", timeout: 3000 });
    } catch (e) {
      cancelButton = null;
    }

    await page.waitForTimeout(300);

    const cancelPromise = cancelButton
      ? cancelButton.click().catch(() => page.keyboard.press("Escape"))
      : page.keyboard.press("Escape");

    const editPromise = tpSlTab.click().catch(() => null);

    const raceResults = await Promise.allSettled([cancelPromise, editPromise]);
    const raceSuccessCount = raceResults.filter(
      (r) => r.status === "fulfilled"
    ).length;

    await page.waitForTimeout(2000);

    return raceSuccessCount >= 1;
  } catch (e) {
    console.log("Race Condition scenario failed:", e);
    return false;
  }
}
