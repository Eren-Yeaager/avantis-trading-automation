import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import {
  testOrderPlacementLatencyAtMarketOpen,
  testOrderPlacementLatencyAtMarketClose,
} from "../helpers/latency-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const latencyScenarios = REGRESSION_SCENARIOS.filter(
  (s) => s.category === "latency"
);

for (const config of latencyScenarios) {
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

      if (config.testName.includes("Open")) {
        const latency = await testOrderPlacementLatencyAtMarketOpen(
          page,
          config.assetPair,
          config.expectedMaxLatency || 5000,
          "10",
          "10",
          async () => {
            try {
              await metamask.confirmSignature();
            } catch (e) {
              console.log("MetaMask signature handling:", e);
            }
          }
        );

        console.log(
          `Order Placement Latency at Market Open (${config.assetPair}): ${latency}ms`
        );
      } else if (config.testName.includes("Close")) {
        await page.getByText("Launch App").first().click();
        await page.waitForTimeout(2000);
        const latency = await testOrderPlacementLatencyAtMarketClose(
          page,
          config.assetPair,
          config.expectedMaxLatency || 5000,
          "10",
          "10",
          async () => {
            try {
              await metamask.confirmSignature();
            } catch (e) {
              console.log("MetaMask signature handling:", e);
            }
          }
        );

        console.log(
          `Position Closure Latency at Market Close (${config.assetPair}): ${latency}ms`
        );
      }
    }
  );
}
