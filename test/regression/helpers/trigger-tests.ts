import { monitorPriceUntilTrigger } from "../utils/price-monitor";
import { TradePage } from "../../trades/TradePage";

export async function testLimitOrderTrigger(
    page: any,
    assetPair: string,
    limitPrice: string,
    priceThreshold: number
): Promise<boolean> {
    const tradePage = new TradePage(page);

    await tradePage.selectAssetPair(assetPair);
    await tradePage.selectOrderType('limit');
    await tradePage.fillLimitPrice(limitPrice);
    await tradePage.fillTradeDetails("1", "10");
    await tradePage.placeLongOrder('limit');

    const limitPriceNum = parseFloat(limitPrice);
    const result = await monitorPriceUntilTrigger(
        page,
        assetPair,
        limitPriceNum,
        'above',
        60000
    );

    const orderStatus = await page
        .locator('[data-testid="order-status"]')
        .textContent();

    return result.triggered && orderStatus?.includes('executed') === true;
}

export async function testTakeProfitTrigger(
    page: any,
    assetPair: string,
    takeProfitPrice: string,
    priceThreshold: number
): Promise<boolean> {
    const tradePage = new TradePage(page);

    await tradePage.selectAssetPair(assetPair);
    await tradePage.fillTradeDetails("1", "10");
    await tradePage.placeLongMarketOrder();

    const tpInput = page.getByTestId('take-profit-input');
    await tpInput.fill(takeProfitPrice);

    const tpPriceNum = parseFloat(takeProfitPrice);
    const result = await monitorPriceUntilTrigger(
        page,
        assetPair,
        tpPriceNum,
        'above',
        120000
    );

    return result.triggered;
}

export async function testStopLossTrigger(
    page: any,
    assetPair: string,
    stopLossPrice: string,
    priceThreshold: number
): Promise<boolean> {
    const tradePage = new TradePage(page);

    await tradePage.selectAssetPair(assetPair);
    await tradePage.fillTradeDetails("1", "10");
    await tradePage.placeLongMarketOrder();

    const slInput = page.getByTestId('stop-loss-input');
    await slInput.fill(stopLossPrice);

    const slPriceNum = parseFloat(stopLossPrice);
    const result = await monitorPriceUntilTrigger(
        page,
        assetPair,
        slPriceNum,
        'below',
        120000
    );

    return result.triggered;
}
