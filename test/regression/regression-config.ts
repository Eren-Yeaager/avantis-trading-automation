export interface RegressionTestConfig {
  testName: string;
  category: "latency";
  assetPair: string;
  timeout?: number;
  expectedMaxLatency?: number;
}

const ASSET_PAIRS = [
  "BTC-USD",
  "ETH-USD",
  "SOL-USD",
  "JPY-USD",
  "XRP-USD",
  "HYPE-USD",
  "FARTCOIN-USD",
  "BONK-USD",
  "PEPE-USD",
  "WIF-USD",
  "DOGE-USD",
];

export const REGRESSION_SCENARIOS: RegressionTestConfig[] = ASSET_PAIRS.flatMap(
  (assetPair) => [
    {
      testName: `Market Open Latency Check - ${assetPair}`,
      category: "latency" as const,
      assetPair,
      expectedMaxLatency: 13000,
    },
    {
      testName: `Market Close Latency Check - ${assetPair}`,
      category: "latency" as const,
      assetPair,
      expectedMaxLatency: 13000,
    },
  ]
);
