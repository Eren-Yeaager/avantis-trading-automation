export interface RegressionTestConfig {
    testName: string;
    category: 'latency' | 'trigger' | 'race-condition' | 'liquidation';
    assetPair: string;
    timeout?: number;
    expectedMaxLatency?: number;
    priceThreshold?: number;
}

export const REGRESSION_SCENARIOS: RegressionTestConfig[] = [
    {
        testName: "Market Open Latency Check",
        category: "latency",
        assetPair: "BTC-USD",
        expectedMaxLatency: 2000,
    },
    {
        testName: "Market Close Latency Check",
        category: "latency",
        assetPair: "BTC-USD",
        expectedMaxLatency: 2000,
    },
    {
        testName: "Limit Order Trigger at Price",
        category: "trigger",
        assetPair: "BTC-USD",
        priceThreshold: 0.01,
    },
    {
        testName: "Take Profit Near Price Trigger",
        category: "trigger",
        assetPair: "BTC-USD",
        priceThreshold: 0.005,
    },
    {
        testName: "Stop Loss Near Price Trigger",
        category: "trigger",
        assetPair: "BTC-USD",
        priceThreshold: 0.005,
    },
    {
        testName: "Cancel Edit Race Condition",
        category: "race-condition",
        assetPair: "BTC-USD",
    },
    {
        testName: "Liquidation Single Execution Check",
        category: "liquidation",
        assetPair: "BTC-USD",
    },
];
