import { testWithSynpress } from "@synthetixio/synpress";
import { expect } from "@playwright/test";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import { testMarketImmediateClose } from "../helpers/market-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";
import { generateMetricsReport } from "../utils/metrics";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const marketScenarios = REGRESSION_SCENARIOS.filter(
  (s) => s.category === "market"
);

for (const config of marketScenarios) {
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

      const result = await testMarketImmediateClose(
        page,
        config.assetPair,
        async () => {
          try {
            await metamask.confirmSignature();
          } catch (e) {
            console.log("MetaMask signature handling:", e);
          }
        }
      );

      expect(result).toBe(true);
    }
  );
}

testCon.afterAll(() => {
  console.log(generateMetricsReport());
});
