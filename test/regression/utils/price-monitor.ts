export async function getCurrentPrice(
  page: any,
  assetPair: string
): Promise<number> {
  try {
    const launchButton = page.getByText("Launch App").first();
    const isLaunchVisible = await launchButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isLaunchVisible) {
      await launchButton.click();
      await page.waitForTimeout(2000);
    }

    const priceElementByTestId = page.locator(
      `[data-testid="price-${assetPair}"]`
    );
    const isTestIdVisible = await priceElementByTestId
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isTestIdVisible) {
      await priceElementByTestId.waitFor({ state: "visible", timeout: 5000 });
      const priceText = await priceElementByTestId.textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, "") || "0");
      if (price > 0) return price;
    }

    const priceElementByText = page
      .locator(`text=/${assetPair}.*\\$[\\d,]+/`)
      .first();
    const isTextVisible = await priceElementByText
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isTextVisible) {
      await priceElementByText.waitFor({ state: "visible", timeout: 5000 });
      const priceText = await priceElementByText.textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, "") || "0");
      if (price > 0) return price;
    }

    const anyPriceElement = page.locator(`text=/\\$[\\d,]+/`).first();
    const priceText = await anyPriceElement
      .textContent({ timeout: 5000 })
      .catch(() => null);

    if (priceText) {
      const price = parseFloat(priceText.replace(/[^0-9.]/g, "") || "0");
      if (price > 0) return price;
    }

    throw new Error(`Could not find price element for ${assetPair}`);
  } catch (e: any) {
    if (
      e.message?.includes("Target page, context or browser has been closed")
    ) {
      throw new Error(
        `Page was closed while trying to get price for ${assetPair}`
      );
    }
    console.log(`Warning: Could not get price for ${assetPair}:`, e.message);
    throw e;
  }
}

export async function waitForPriceChange(
  page: any,
  assetPair: string,
  initialPrice: number,
  threshold: number,
  timeout: number = 30000
): Promise<number> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const currentPrice = await getCurrentPrice(page, assetPair);
    const priceDiff = Math.abs(currentPrice - initialPrice) / initialPrice;

    if (priceDiff >= threshold) {
      return currentPrice;
    }
    await page.waitForTimeout(500);
  }
  throw new Error(
    `Price did not change within threshold ${threshold} within ${timeout}ms`
  );
}

export async function monitorPriceUntilTrigger(
  page: any,
  assetPair: string,
  triggerPrice: number,
  direction: "above" | "below",
  timeout: number = 60000
): Promise<{ triggered: boolean; finalPrice: number; timeToTrigger: number }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentPrice = await getCurrentPrice(page, assetPair);

    if (
      (direction === "above" && currentPrice >= triggerPrice) ||
      (direction === "below" && currentPrice <= triggerPrice)
    ) {
      return {
        triggered: true,
        finalPrice: currentPrice,
        timeToTrigger: Date.now() - startTime,
      };
    }
    await page.waitForTimeout(500);
  }

  return {
    triggered: false,
    finalPrice: await getCurrentPrice(page, assetPair),
    timeToTrigger: timeout,
  };
}
