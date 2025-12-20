import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask, getExtensionId } from "@synthetixio/synpress/playwright";
import { ethers } from "ethers";
import "dotenv/config";

const PASSWORD = process.env.PASSWORD || "test123@2000";
const CONNECTED_WALLET_PK = process.env.CONNECTED_WALLET_PK || "";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, "MetaMask");
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);
  const freshWallet = ethers.Wallet.createRandom();
  const page = await context.newPage();
  if (!freshWallet.mnemonic) {
    throw new Error("Failed to generate wallets with mnemonic");
  }
  await metamask.importWallet(freshWallet.mnemonic.phrase);
  await metamask.importWalletFromPrivateKey(CONNECTED_WALLET_PK)
  await metamask.addNetwork({
    name: "Base",
    rpcUrl: "https://mainnet.base.org",
    chainId: 8453,
    symbol: "ETH",
    blockExplorerUrl: "https://basescan.org",
  });
  
  await metamask.page.mouse.click(10, 10);

  const gotItButton = metamask.page.getByRole("button", { name: "Got it" });
  if (await gotItButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gotItButton.click();
  }
  await metamask.page.mouse.click(10, 10);
  await metamask.page.mouse.click(10, 10);
  await page.waitForTimeout(2000);

  await metamask.switchAccount("Account 2")
  
  await page.goto("https://www.avantisfi.com/");
  
  await page.getByText("Launch App").first().click();
  
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.waitForTimeout(2000);
  await page.getByText("Continue with a wallet").click();
  await page.waitForTimeout(2000);
  await page.getByText("MetaMask").click();
  await metamask.connectToDapp(["Account 2"]);
  await page.waitForTimeout(2000);
});