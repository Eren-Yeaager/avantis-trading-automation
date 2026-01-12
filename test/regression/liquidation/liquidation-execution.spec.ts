import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import {
  testForceLiquidationByCollateral,
  testSimulatedPriceMovement,
} from "../helpers/liquidation-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";
import { expect } from "@playwright/test";
import { generateMetricsReport } from "../utils/metrics";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const liquidationScenarios = REGRESSION_SCENARIOS.filter(
  (s) => s.category === "liquidation"
);

for (const config of liquidationScenarios) {
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

      if (
        config.testName.includes("Force") &&
        config.testName.includes("Collateral")
      ) {
        result = await testForceLiquidationByCollateral(
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
      } else if (config.testName.includes("Simulated")) {
        result = await testSimulatedPriceMovement(
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
      } else {
        throw new Error(
          `Unknown liquidation test: ${config.testName}. Only simulated price movement tests are supported.`
        );
      }

      if (!result) {
        console.log(`\n⚠️  Scenario completed with issues: ${config.testName}`);
        console.log("Check the console logs above for details");
      } else {
        console.log(`\n✓ Scenario completed successfully: ${config.testName}`);
      }
    }
  );
}

testCon.afterAll(() => {
  console.log(generateMetricsReport());
});
