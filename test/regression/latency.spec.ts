import { test, expect } from "@playwright/test";
import { openTrade, closeTrade, getTrades } from "./sdk";
import "dotenv/config";

const privateKey = process.env.CONNECTED_WALLET_PK || "";

test.describe("Latency Tests", () => {
  test.beforeEach(() => {
    test.setTimeout(120000);
    if (!privateKey) {
      throw new Error("CONNECTED_WALLET_PK environment variable is required");
    }
  });

  test("Measure trade open latency", async () => {
    const assetPair = "BTC-USD";
    const collateral = "1";
    const leverage = "10";
    const maxLatency = 30000;

    const tradesResult = await getTrades(privateKey);
    expect(tradesResult.success).toBe(true);

    if (tradesResult.count > 0) {
      console.log(
        `Found ${tradesResult.count} existing trade(s), skipping open test`
      );
      return;
    }

    console.log(
      `Opening trade: ${assetPair}, Collateral: ${collateral}, Leverage: ${leverage}x`
    );

    const startTime = Date.now();
    const result = await openTrade(privateKey, assetPair, collateral, leverage);
    const latency = Date.now() - startTime;

    expect(result.success).toBe(true);
    expect(result.txHash).toBeDefined();
    expect(latency).toBeLessThan(maxLatency);

    console.log(`✅ Trade opened in ${latency}ms`);
    console.log(`   Transaction: ${result.txHash}`);
    console.log(
      `   Trade Index: ${result.tradeIndex}, Pair Index: ${result.pairIndex}`
    );
    console.log(`   Execution Latency: ${latency}ms`);
  });

  test("Measure trade close latency", async () => {
    const assetPair = "BTC-USD";
    const collateral = "10";
    const leverage = "10";
    const maxLatency = 30000;

    const tradesResult = await getTrades(privateKey);
    expect(tradesResult.success).toBe(true);

    let tradeIndex: number;
    let pairIndex: number;

    if (tradesResult.count > 0) {
      console.log(`Using existing trade for close test...`);
      const firstTrade = tradesResult.trades[0];
      tradeIndex = firstTrade.tradeIndex;
      pairIndex = firstTrade.pairIndex;
    } else {
      console.log(`Opening new trade for close test...`);
      const openResult = await openTrade(
        privateKey,
        assetPair,
        collateral,
        leverage
      );
      expect(openResult.success).toBe(true);
      tradeIndex = openResult.tradeIndex!;
      pairIndex = openResult.pairIndex!;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(`Closing trade: Index ${tradeIndex}, Pair ${pairIndex}`);

    const startTime = Date.now();
    const closeResult = await closeTrade(privateKey, tradeIndex, pairIndex);
    const latency = Date.now() - startTime;

    if (!closeResult.success) {
      console.error(`❌ Close trade failed: ${closeResult.error}`);
    }
    expect(closeResult.success).toBe(true);
    expect(closeResult.txHash).toBeDefined();
    expect(latency).toBeLessThan(maxLatency);

    console.log(`✅ Trade closed in ${latency}ms`);
    console.log(`   Transaction: ${closeResult.txHash}`);
    console.log(`   Execution Latency: ${latency}ms`);
  });
});
