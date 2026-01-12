import {
  hasOpenPosition,
  ensureAppLaunched,
  createMarketOrder,
} from "./shared-utils";

export { hasOpenPosition, ensureAppLaunched };

export async function ensureOpenMarketOrder(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<void> {
  const hasPosition = await hasOpenPosition(page);
  if (hasPosition) {
    console.log("Open position already exists, skipping order placement");
    return;
  }

  console.log("No open position found, creating a market order...");
  await createMarketOrder(page, assetPair, "1", "10", metamaskConfirmation);

  const positionCreated = await hasOpenPosition(page);
  if (!positionCreated) {
    throw new Error("Failed to create open position for race condition test");
  }
}

export async function getOriginalInvestedAmount(page: any): Promise<number> {
  try {
    const investedText = await page
      .locator('[data-testid*="invested"], [data-testid*="collateral"]')
      .or(page.locator("text=/invested|collateral/i"))
      .first()
      .textContent()
      .catch(() => null);

    if (investedText) {
      const match = investedText.match(/[\d.]+/);
      if (match) {
        return parseFloat(match[0]);
      }
    }

    const value = await page
      .locator('[data-testid*="collateral"], [data-testid*="invested"]')
      .first()
      .inputValue()
      .catch(() => null);

    return value ? parseFloat(value) : 1.0;
  } catch (e) {
    console.log("Could not read original invested amount, defaulting to 1.0");
    return 1.0;
  }
}

export async function setAndVerifyInput(
  page: any,
  testId: string,
  value: string,
  description: string,
  usePattern: boolean = false
): Promise<boolean> {
  try {
    let input;
    if (usePattern) {
      input = page
        .locator(`[data-testid="${testId}"]`)
        .or(page.locator(`[data-testid*="${testId}"]`))
        .first();
    } else {
      input = page.locator(`[data-testid="${testId}"]`).first();
    }

    await input.waitFor({ state: "visible", timeout: 5000 });
    await input.clear();
    await input.fill(value);
    await page.waitForTimeout(500);

    const actualValue = await input.inputValue();
    const isSet =
      actualValue === value ||
      Math.abs(parseFloat(actualValue) - parseFloat(value)) < 0.001;

    if (isSet) {
      console.log(`✓ ${description} set to ${value}`);
      return true;
    } else {
      console.log(
        `✗ ${description} verification failed. Expected: ${value}, Got: ${actualValue}`
      );
      return false;
    }
  } catch (e) {
    console.log(`✗ Failed to set ${description}:`, e);
    return false;
  }
}

export async function openEditModal(page: any): Promise<{
  collateralTab: any;
  tpSlTab: any;
}> {
  const editButton = page.getByTestId("edit-trade-trigger").first();

  try {
    await editButton.waitFor({ state: "visible", timeout: 3000 });
  } catch (e) {
    try {
      const fallbackButton = page.locator("img[data-nimg]").first();
      await fallbackButton.waitFor({ state: "visible", timeout: 3000 });
      await fallbackButton.click();
      await page.waitForTimeout(1000);
      await ensureAppLaunched(page);

      const modalTabs = page.locator(
        '[data-testid="edit-position-header-button"]'
      );
      await modalTabs.first().waitFor({ state: "visible", timeout: 10000 });

      const collateralTab = page
        .locator('[data-testid="edit-position-header-button"]')
        .filter({ hasText: /collateral/i })
        .first();

      const tpSlTab = page
        .locator('[data-testid="edit-position-header-button"]')
        .filter({ hasText: /tp\/sl|tp|sl/i })
        .first();

      return { collateralTab, tpSlTab };
    } catch (e2) {
      throw new Error("Could not find edit button");
    }
  }

  await editButton.scrollIntoViewIfNeeded();
  await editButton.click();
  await page.waitForTimeout(1000);

  await ensureAppLaunched(page);

  const modalTabs = page.locator('[data-testid="edit-position-header-button"]');
  const isModalOpen = await modalTabs
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (!isModalOpen) {
    console.log("Modal closed, reopening edit modal...");
    try {
      const editButtonAgain = page.getByTestId("edit-trade-trigger").first();
      await editButtonAgain.waitFor({ state: "visible", timeout: 3000 });
      await editButtonAgain.click();
      await page.waitForTimeout(1000);
    } catch (e) {
      try {
        const fallbackButton = page.locator("img[data-nimg]").first();
        await fallbackButton.waitFor({ state: "visible", timeout: 3000 });
        await fallbackButton.click();
        await page.waitForTimeout(1000);
      } catch (e2) {
        console.log("Could not reopen edit modal:", e2);
      }
    }
  }

  await modalTabs.first().waitFor({ state: "visible", timeout: 10000 });

  const collateralTab = page
    .locator('[data-testid="edit-position-header-button"]')
    .filter({ hasText: /collateral/i })
    .first();

  const tpSlTab = page
    .locator('[data-testid="edit-position-header-button"]')
    .filter({ hasText: /tp\/sl|tp|sl/i })
    .first();

  return { collateralTab, tpSlTab };
}

export async function ensureEditModalOpen(page: any): Promise<void> {
  await ensureAppLaunched(page);

  const modalCheck = page.locator(
    '[data-testid="edit-position-header-button"]'
  );
  const isModalStillOpen = await modalCheck
    .first()
    .isVisible({ timeout: 2000 })
    .catch(() => false);

  if (!isModalStillOpen) {
    try {
      const editButtonAgain = page.getByTestId("edit-trade-trigger").first();
      if (
        await editButtonAgain.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await editButtonAgain.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      const fallbackButton = page.locator("img[data-nimg]").first();
      if (
        await fallbackButton.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        await fallbackButton.click();
        await page.waitForTimeout(1000);
      }
    }
  }
}
