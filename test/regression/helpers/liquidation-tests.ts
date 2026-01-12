import { TradePage } from "../../trades/TradePage";
import { monitorPriceUntilTrigger, getCurrentPrice } from "../utils/price-monitor";

export async function testLiquidationSingleExecution(
    page: any,
    assetPair: string
): Promise<boolean> {
    const tradePage = new TradePage(page);

    await tradePage.selectAssetPair(assetPair);
    await tradePage.fillTradeDetails("1", "50");
    await tradePage.placeLongMarketOrder();

    const initialPositions = await page
        .locator('[data-testid^="position-"]')
        .count();

    const currentPrice = await getCurrentPrice(page, assetPair);
    const liquidationPrice = currentPrice * 0.98;

    await monitorPriceUntilTrigger(
        page,
        assetPair,
        liquidationPrice,
        'below',
        300000
    );

    await page.waitForTimeout(5000);

    const finalPositions = await page
        .locator('[data-testid^="position-"]')
        .count();

    const liquidationExecuted = finalPositions === initialPositions - 1;

    const liquidationEvents = await page
        .locator('[data-testid="liquidation-event"]')
        .count();

    return liquidationExecuted && liquidationEvents === 1;
}
