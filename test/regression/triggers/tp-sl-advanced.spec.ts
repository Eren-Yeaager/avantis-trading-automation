import { testWithSynpress } from "@synthetixio/synpress";
import { expect } from "@playwright/test";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import {
  testTPSLNearPrice,
  testTPSLPriceSpike,
  testEditTPSLNearTrigger,
} from "../helpers/trigger-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";
import { generateMetricsReport } from "../utils/metrics";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const advancedTriggerScenarios = REGRESSION_SCENARIOS.filter(
  (s) =>
    s.category === "trigger" &&
    (s.testName.includes("Near Price") ||
      s.testName.includes("Price Spike") ||
      s.testName.includes("Edit"))
);

for (const config of advancedTriggerScenarios) {
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
      const triggerType = config.testName.includes("TP") ? "tp" : "sl";

      const metamaskConfirmation = async () => {
        try {
          await metamask.confirmSignature();
        } catch (e) {
          console.log("MetaMask signature handling:", e);
        }
      };

      if (config.testName.includes("Near Price")) {
        result = await testTPSLNearPrice(
          page,
          config.assetPair,
          triggerType,
          config.priceThreshold
        );
      } else if (config.testName.includes("Price Spike")) {
        result = await testTPSLPriceSpike(page, config.assetPair, triggerType);
      } else if (config.testName.includes("Edit")) {
        result = await testEditTPSLNearTrigger(
          page,
          config.assetPair,
          triggerType
        );
      } else {
        throw new Error(`Unknown trigger test: ${config.testName}`);
      }

      if (!result) {
        console.log(
          `\n⚠️  Trigger test completed with issues: ${config.testName}`
        );
        console.log("Check the console logs above for details");
      } else {
        console.log(
          `\n✓ Trigger test completed successfully: ${config.testName}`
        );
      }

      expect(result).toBe(true);
    }
  );
}

testCon.afterAll(() => {
  console.log(generateMetricsReport());
});
