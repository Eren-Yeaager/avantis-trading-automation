export async function getCurrentPrice(page: any, assetPair: string): Promise<number> {
    const priceElement = page.locator(`[data-testid="price-${assetPair}"]`).or(
        page.locator(`text=/${assetPair}.*\\$[\\d,]+/`).first()
    );
    const priceText = await priceElement.textContent();
    return parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');
}

export async function waitForPriceChange(
    page: any,
    assetPair: string,
    initialPrice: number,
    threshold: number,
    timeout: number = 30000
): Promise<number> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const currentPrice = await getCurrentPrice(page, assetPair);
        const priceDiff = Math.abs(currentPrice - initialPrice) / initialPrice;

        if (priceDiff >= threshold) {
            return currentPrice;
        }
        await page.waitForTimeout(500);
    }
    throw new Error(`Price did not change within threshold ${threshold} within ${timeout}ms`);
}

export async function monitorPriceUntilTrigger(
    page: any,
    assetPair: string,
    triggerPrice: number,
    direction: 'above' | 'below',
    timeout: number = 60000
): Promise<{ triggered: boolean; finalPrice: number; timeToTrigger: number }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const currentPrice = await getCurrentPrice(page, assetPair);

        if (
            (direction === 'above' && currentPrice >= triggerPrice) ||
            (direction === 'below' && currentPrice <= triggerPrice)
        ) {
            return {
                triggered: true,
                finalPrice: currentPrice,
                timeToTrigger: Date.now() - startTime,
            };
        }
        await page.waitForTimeout(500);
    }

    return {
        triggered: false,
        finalPrice: await getCurrentPrice(page, assetPair),
        timeToTrigger: timeout,
    };
}
