export interface RegressionTestConfig {
  testName: string;
  category:
    | "latency"
    | "trigger"
    | "race-condition"
    | "liquidation"
    | "market"
    | "limit";
  assetPair: string;
  timeout?: number;
  expectedMaxLatency?: number;
  priceThreshold?: number;
  positionType?: "long" | "short";
  userType?: "EOA" | "1CT";
}

export const REGRESSION_SCENARIOS: RegressionTestConfig[] = [
  {
    testName: "Market Open Latency Check",
    category: "latency",
    assetPair: "BTC-USD",
    expectedMaxLatency: 10000,
  },
  {
    testName: "Market Close Latency Check",
    category: "latency",
    assetPair: "BTC-USD",
    expectedMaxLatency: 10000,
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
    testName: "Market Immediate Close",
    category: "market",
    assetPair: "BTC-USD",
    positionType: "long",
    userType: "EOA",
  },
  {
    testName: "TP Near Price Trigger",
    category: "trigger",
    assetPair: "BTC-USD",
    priceThreshold: 0.001,
  },
  {
    testName: "SL Near Price Trigger",
    category: "trigger",
    assetPair: "BTC-USD",
    priceThreshold: 0.001,
  },
  {
    testName: "TP Price Spike Through",
    category: "trigger",
    assetPair: "BTC-USD",
  },
  {
    testName: "SL Price Spike Through",
    category: "trigger",
    assetPair: "BTC-USD",
  },
  {
    testName: "Edit TP Near Trigger",
    category: "trigger",
    assetPair: "BTC-USD",
  },
  {
    testName: "Edit SL Near Trigger",
    category: "trigger",
    assetPair: "BTC-USD",
  },
  {
    testName: "Cancel Limit Before Execution",
    category: "limit",
    assetPair: "BTC-USD",
  },
  {
    testName: "Edit Limit Price Rapidly",
    category: "limit",
    assetPair: "BTC-USD",
  },
  {
    testName: "Force Liquidation by Collateral",
    category: "liquidation",
    assetPair: "BTC-USD",
    userType: "EOA",
  },
  {
    testName: "Simulated Price Movement Liquidation",
    category: "liquidation",
    assetPair: "BTC-USD",
    userType: "EOA",
  },
];
