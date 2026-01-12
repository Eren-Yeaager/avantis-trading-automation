import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import {
  testLimitOrderTrigger,
  testTakeProfitTrigger,
  testStopLossTrigger,
} from "../helpers/trigger-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";
import { expect } from "@playwright/test";
const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const triggerScenarios = REGRESSION_SCENARIOS.filter(
  (s) => s.category === "trigger"
);

for (const config of triggerScenarios) {
  testCon(
    config.testName,
    async ({ context, page, metamaskPage, extensionId }) => {
      const metamask = new MetaMask(
        context,
        metamaskPage,
        "Tester@1234",
        extensionId
      );

      await metamask.page.mouse.click(10, 10);
      await page.waitForTimeout(500);
      await page.getByText("Launch App").first().click();
      await page.waitForTimeout(2000);

      if (config.testName.includes("Limit Order")) {
        const triggered = await testLimitOrderTrigger(
          page,
          config.assetPair,
          "50000",
          config.priceThreshold || 0.01
        );
        expect(triggered).toBe(true);
      } else if (config.testName.includes("Take Profit")) {
        const triggered = await testTakeProfitTrigger(
          page,
          config.assetPair,
          "51000",
          config.priceThreshold || 0.005
        );
        expect(triggered).toBe(true);
      } else if (config.testName.includes("Stop Loss")) {
        const triggered = await testStopLossTrigger(
          page,
          config.assetPair,
          "49000",
          config.priceThreshold || 0.005
        );
        expect(triggered).toBe(true);
      }
    }
  );
}
