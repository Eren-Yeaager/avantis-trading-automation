import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import basicSetup from "../wallet-setup/basic.setup";
const testCon = testWithSynpress(metaMaskFixtures(basicSetup));
testCon(
    "Verify that user is able to connect wallet to Avatis",
    async ({ context, page, metamaskPage, extensionId }) => {
      const metamask = new MetaMask(
        context,
        metamaskPage,
        "Tester@1234",
        extensionId
      );
      await metamask.page.mouse.click(10, 10);
      await page.waitForTimeout(500);
      
      
    })