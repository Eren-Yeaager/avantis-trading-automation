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
    await metamask.page.mouse.click(10, 10);
    await page.goto("/");
    await page.getByText("Launch App").first().click();
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: "Connect Wallet" }).click();
    await page.waitForTimeout(2000);
    await page.getByText("Continue with a wallet").click();
    await page.waitForTimeout(2000);
    await page.getByText("MetaMask").click();
    await metamask.connectToDapp(["Account 1"]);
    await page.waitForTimeout(3000);
  }
);
