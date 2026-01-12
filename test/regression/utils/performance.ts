export async function measureLatency(operation: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await operation();
    return Date.now() - startTime;
}

export async function measureMarketOpenLatency(page: any): Promise<number> {
    return measureLatency(async () => {
        await page.getByText("Launch App").first().click();
        await page.waitForSelector('[data-testid="trading-interface"]', {
            state: 'visible',
            timeout: 10000
        });
    });
}

export async function measureMarketCloseLatency(page: any): Promise<number> {
    return measureLatency(async () => {
        const closeButton = page.getByRole('button', { name: /close|exit/i });
        await closeButton.click();
        await page.waitForSelector('[data-testid="trading-interface"]', {
            state: 'hidden',
            timeout: 10000
        });
    });
}

export function assertLatencyWithinThreshold(
    actualLatency: number,
    maxLatency: number,
    testName: string
): void {
    if (actualLatency > maxLatency) {
        throw new Error(
            `${testName} failed: Latency ${actualLatency}ms exceeds threshold ${maxLatency}ms`
        );
    }
}
