
import { MetaMask } from "@synthetixio/synpress/playwright";
import { TradePage } from "./TradePage";
import type { TradeConfig } from "./trade-config";

export class TradeHelper {
  private tradePage: TradePage;
  private page: any;
  private metamask: MetaMask;

  constructor(page: any, metamask: MetaMask) {
    this.page = page;
    this.metamask = metamask;
    this.tradePage = new TradePage(page);
  }

  async executeLongMarketTrade(config: TradeConfig) {
    await this.metamask.page.mouse.click(10, 10);
    await this.page.waitForTimeout(500);
    await this.tradePage.navigateToApp();
    await this.tradePage.selectAssetPair(config.assetPair);
    await this.tradePage.fillTradeDetails(config.collateral, config.leverage);
    await this.tradePage.placeLongMarketOrder();
    await this.metamask.confirmSignature();
    await this.page.waitForTimeout(4000);
  }
}