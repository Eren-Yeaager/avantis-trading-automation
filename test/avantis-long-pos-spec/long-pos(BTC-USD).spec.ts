import { testWithSynpress } from "@synthetixio/synpress";
import {
  getExtensionId,
  MetaMask,
  metaMaskFixtures,
} from "@synthetixio/synpress/playwright";
import connectedSetup from "../wallet-setup/connected.setup";
const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));
testCon(
    "Long Pos trade on BTC-USD",
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
 await page.getByTestId('collateral-input').fill("1")
 await page.getByTestId('leverage-input').fill("10")
 await page.getByRole('button',{name:"Place Order"}).click()
 await page.getByRole('button',{name:"Confirm Market Long"}).click()
 await metamask.confirmSignature()
 await page.waitForTimeout(4000)
    })