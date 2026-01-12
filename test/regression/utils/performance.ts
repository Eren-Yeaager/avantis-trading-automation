export async function measureLatency(
  operation: () => Promise<void>
): Promise<number> {
  const startTime = Date.now();
  await operation();
  return Date.now() - startTime;
}

export async function measureMarketOpenLatency(page: any): Promise<number> {
  return measureLatency(async () => {
    await page.getByText("Launch App").first().click();
    await page.waitForSelector('[data-testid="trading-interface"]', {
      state: "visible",
      timeout: 10000,
    });
  });
}

export async function measureMarketCloseLatency(page: any): Promise<number> {
  return measureLatency(async () => {
    const closeButton = page.getByRole("button", { name: /close|exit/i });
    await closeButton.click();
    await page.waitForSelector('[data-testid="trading-interface"]', {
      state: "hidden",
      timeout: 10000,
    });
  });
}

export async function measureOrderPlacementLatencyAtMarketOpen(
  page: any,
  assetPair: string,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  return measureLatency(async () => {
    await page.getByText("Launch App").first().click();
    await page.waitForTimeout(2000);

    if (assetPair !== "BTC-USD") {
      const assetPairSelector = page
        .locator('div[role="button"]')
        .filter({ has: page.locator("svg.lucide-chevron-down") })
        .nth(1);
      await assetPairSelector.click();
      await page.waitForTimeout(1000);

      const searchInput = page
        .locator('input[type="search"]')
        .or(page.locator("input").first());
      await searchInput.waitFor({ state: "visible", timeout: 3000 });

      const searchTerm = assetPair.split("-")[0];
      await page.waitForTimeout(300);
      await searchInput.type(searchTerm, { delay: 100 });
      await page.waitForTimeout(1500);
      await page.getByText(searchTerm, { exact: false }).first().click();
      await page.waitForTimeout(1000);
    }

    const collateralInput = page.getByTestId("collateral-input");
    const leverageInput = page.getByTestId("leverage-input");
    await collateralInput.fill(collateral);
    await leverageInput.fill(leverage);
    await page.waitForTimeout(500);

    const placeOrderButton = page.getByRole("button", { name: "Place Order" });
    const confirmLongButton = page.getByRole("button", {
      name: "Confirm Market Long",
    });

    await placeOrderButton.click();
    await confirmLongButton.click();

    if (metamaskConfirmation) {
      await page.waitForTimeout(1000);
      await metamaskConfirmation();
    }

    try {
      await Promise.race([
        page
          .waitForSelector('[data-testid="order-success"]', { timeout: 15000 })
          .catch(() => null),
        page
          .waitForSelector('[data-testid="position-created"]', {
            timeout: 15000,
          })
          .catch(() => null),
        page
          .getByText(/order.*placed|order.*confirmed|position.*opened/i)
          .waitFor({ timeout: 15000 })
          .catch(() => null),
        page
          .waitForSelector("text=/success|confirmed/i", { timeout: 15000 })
          .catch(() => null),

        page
          .locator('[data-testid*="position"]')
          .first()
          .waitFor({ timeout: 15000 })
          .catch(() => null),
      ]);
    } catch (e) {
      await page.waitForTimeout(3000);
    }
  });
}

export async function measureOrderPlacementLatencyAtMarketClose(
  page: any,
  assetPair: string,
  collateral: string = "1",
  leverage: string = "10",
  metamaskConfirmation?: () => Promise<void>
): Promise<number> {
  return measureLatency(async () => {
    await page.waitForTimeout(1000);

    const closePositionTrigger = page
      .getByTestId("close-position-trigger")
      .first();
    await closePositionTrigger.waitFor({ state: "visible", timeout: 10000 });

    await closePositionTrigger.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await closePositionTrigger.click();
    await page.waitForTimeout(500);

    const confirmTradeButton = page.getByTestId("confirm-trade-button");
    await confirmTradeButton.waitFor({ state: "visible", timeout: 10000 });
    await confirmTradeButton.click();

    if (metamaskConfirmation) {
      await page.waitForTimeout(1000);
      await metamaskConfirmation();
    }

    try {
      await Promise.race([
        page
          .waitForSelector('[data-testid="position-closed"]', {
            timeout: 15000,
          })
          .catch(() => null),
        page
          .waitForSelector('[data-testid="close-success"]', { timeout: 15000 })
          .catch(() => null),
        page
          .getByText(/position.*closed|position.*closed|trade.*closed/i)
          .waitFor({ timeout: 15000 })
          .catch(() => null),
        page
          .waitForSelector("text=/closed|success|confirmed/i", {
            timeout: 15000,
          })
          .catch(() => null),

        page
          .waitForFunction(
            () => {
              const positions = document.querySelectorAll(
                '[data-testid^="position-"]'
              );
              return positions.length === 0;
            },
            { timeout: 15000 }
          )
          .catch(() => null),
      ]);
    } catch (e) {
      await page.waitForTimeout(3000);
    }
  });
}

export function assertLatencyWithinThreshold(
  actualLatency: number,
  maxLatency: number,
  testName: string
): void {
  if (actualLatency > maxLatency) {
    throw new Error(
      `${testName} failed: Latency ${actualLatency}ms exceeds threshold ${maxLatency}ms`
    );
  }
}
