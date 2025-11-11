import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask, getExtensionId } from "@synthetixio/synpress/playwright";
import { ethers } from "ethers";
import "dotenv/config";

const PASSWORD = process.env.PASSWORD || "test123@2000";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, "MetaMask");
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId);

  const freshWallet = ethers.Wallet.createRandom();

  if (!freshWallet.mnemonic) {
    throw new Error("Failed to generate wallets with mnemonic");
  }

  await metamask.importWallet(freshWallet.mnemonic.phrase);
  console.log(freshWallet.mnemonic.phrase);
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
});
