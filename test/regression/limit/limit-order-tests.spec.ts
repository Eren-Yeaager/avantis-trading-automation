import { testWithSynpress } from "@synthetixio/synpress";
import { expect } from "@playwright/test";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import {
  testCancelLimitBeforeExecution,
  testEditLimitPriceRapidly,
} from "../helpers/limit-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";
import { generateMetricsReport } from "../utils/metrics";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const limitScenarios = REGRESSION_SCENARIOS.filter(
  (s) => s.category === "limit"
);

for (const config of limitScenarios) {
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

      let result: boolean;

      if (config.testName.includes("Cancel")) {
        result = await testCancelLimitBeforeExecution(page, config.assetPair);
      } else if (config.testName.includes("Edit")) {
        result = await testEditLimitPriceRapidly(page, config.assetPair);
      } else {
        throw new Error(`Unknown limit test: ${config.testName}`);
      }

      expect(result).toBe(true);
    }
  );
}

testCon.afterAll(() => {
  console.log(generateMetricsReport());
});
