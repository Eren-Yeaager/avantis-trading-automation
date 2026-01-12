
export class TradePage {
  readonly page: any;
  readonly collateralInput
  readonly leverageInput
  readonly placeOrderButton
  readonly confirmLongButton
  readonly assetPairSelector

  constructor(page: any) {
    this.page = page;
    this.collateralInput = page.getByTestId('collateral-input');
    this.leverageInput = page.getByTestId('leverage-input');
    this.placeOrderButton = page.getByRole('button', { name: "Place Order" });
    this.confirmLongButton = page.getByRole('button', { name: "Confirm Market Long" });
    this.assetPairSelector = page.locator('div[role="button"]')
    .filter({ has: page.locator('svg.lucide-chevron-down') })
    .nth(1);  }

  async navigateToApp() {
    await this.page.getByText("Launch App").first().click();
    await this.page.waitForTimeout(2000);
  }

  async selectAssetPair(pair: string) {
    if (pair === "BTC-USD") {
        return;
      }
    await this.assetPairSelector.click();
    await this.page.waitForTimeout(1000);
    

    const searchInput = this.page.locator('input[type="search"]').or(
      this.page.locator('input').first()
    );
    await searchInput.waitFor({ state: 'visible', timeout: 3000 });
    
    
  const searchTerm = pair.split('-')[0];
  await this.page.waitForTimeout(300);
  await searchInput.type(searchTerm, { delay: 100 });
  await this.page.waitForTimeout(1500);
  
  await this.page.getByText(searchTerm, { exact: false }).first().click();
  await this.page.waitForTimeout(1000);
  }

  async fillTradeDetails(collateral: string, leverage: string) {
    await this.collateralInput.fill(collateral);
    await this.leverageInput.fill(leverage);
  }

  async placeLongMarketOrder() {
    await this.placeOrderButton.click();
    await this.confirmLongButton.click();
  }

  async selectOrderType(orderType: string) {
    const orderTypeButton = this.page.getByRole('button', { name: new RegExp(orderType, 'i') }).or(
      this.page.locator(`[data-testid="order-type-${orderType}"]`)
    );
    await orderTypeButton.click();
    await this.page.waitForTimeout(500);
  }

  async fillLimitPrice(price: string) {
    const limitPriceInput = this.page.getByTestId('limit-price-input').or(
      this.page.locator('input[placeholder*="limit" i]')
    );
    await limitPriceInput.fill(price);
    await this.page.waitForTimeout(500);
  }

  async placeLongOrder(orderType: string) {
    await this.placeOrderButton.click();
    const confirmButton = this.page.getByRole('button', { 
      name: new RegExp(`confirm.*${orderType}.*long`, 'i') 
    }).or(this.confirmLongButton);
    await confirmButton.click();
  }
}