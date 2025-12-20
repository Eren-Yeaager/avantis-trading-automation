import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../wallet-setup/connected.setup";
import { TradeHelper } from "./TradeHelper";
import { LONG_MARKET_SCENARIOS } from "./trade-config";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

for (const config of LONG_MARKET_SCENARIOS) {
  testCon(
    `Long Market Order: ${config.assetPair} - ${config.collateral} USDC @ ${config.leverage}x`,
    async ({ context, page, metamaskPage, extensionId }) => {
      const metamask = new MetaMask(
        context,
        metamaskPage,
        "Tester@1234",
        extensionId
      );
      const tradeHelper = new TradeHelper(page, metamask);
      await tradeHelper.executeLongMarketTrade(config);
    }
  );
}