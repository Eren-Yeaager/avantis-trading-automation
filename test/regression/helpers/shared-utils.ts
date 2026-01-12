import { TradePage } from "../../trades/TradePage";

export async function ensureAppLaunched(page: any): Promise<void> {
  try {
    const launchButton = page.getByText("Launch App").first();
    const isVisible = await launchButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isVisible) {
      console.log("Detected launch page, clicking 'Launch App'...");
      await launchButton.click();
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log("Already in app or launch button not found");
  }
}

export async function hasOpenPosition(page: any): Promise<boolean> {
  try {
    const positions = await page
      .locator('[data-testid^="position-"]')
      .or(page.locator('[data-testid="close-position-trigger"]'))
      .count();
    return positions > 0;
  } catch (e) {
    return false;
  }
}

export async function createMarketOrder(
  page: any,
  assetPair: string,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<void> {
  const tradePage = new TradePage(page);
  await tradePage.selectAssetPair(assetPair);
  await tradePage.fillTradeDetails(collateral, leverage);
  await tradePage.placeLongMarketOrder();

  if (metamaskConfirmation) {
    await page.waitForTimeout(1000);
    await metamaskConfirmation();
    await ensureAppLaunched(page);
  }

  await page.waitForTimeout(3000);
}
