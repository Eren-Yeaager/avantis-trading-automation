import { TradePage } from "../../trades/TradePage";

export async function testCancelEditRaceCondition(
    page: any,
    assetPair: string
): Promise<boolean> {
    const tradePage = new TradePage(page);

    await tradePage.selectAssetPair(assetPair);
    await tradePage.selectOrderType('limit');
    await tradePage.fillLimitPrice("50000");
    await tradePage.fillTradeDetails("1", "10");
    await tradePage.placeLongOrder('limit');

    const cancelPromise = page
        .getByRole('button', { name: /cancel/i })
        .click();

    const editPromise = page
        .getByRole('button', { name: /edit/i })
        .click();

    const results = await Promise.allSettled([cancelPromise, editPromise]);
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    const orderStatus = await page
        .locator('[data-testid="order-status"]')
        .textContent();

    return successCount === 1 && (orderStatus?.includes('cancelled') || orderStatus?.includes('edited'));
}
