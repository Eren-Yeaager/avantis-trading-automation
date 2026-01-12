import { scenarioLimitOrderTrigger } from "./scenarios/triggers/limit-order-trigger.scenario";
import { scenarioTakeProfitTrigger } from "./scenarios/triggers/take-profit-trigger.scenario";
import { scenarioStopLossTrigger } from "./scenarios/triggers/stop-loss-trigger.scenario";
import { scenarioTPSLNearPrice } from "./scenarios/triggers/tp-sl-near-price.scenario";
import { scenarioTPSLPriceSpike } from "./scenarios/triggers/tp-sl-price-spike.scenario";
import { scenarioEditTPSLNearTrigger } from "./scenarios/triggers/edit-tp-sl-near-trigger.scenario";

export async function testLimitOrderTrigger(
  page: any,
  assetPair: string,
  limitPrice: string,
  priceThreshold: number
): Promise<boolean> {
  return await scenarioLimitOrderTrigger(
    page,
    assetPair,
    limitPrice,
    priceThreshold
  );
}

export async function testTakeProfitTrigger(
  page: any,
  assetPair: string,
  takeProfitPrice: string,
  priceThreshold: number
): Promise<boolean> {
  return await scenarioTakeProfitTrigger(
    page,
    assetPair,
    takeProfitPrice,
    priceThreshold
  );
}

export async function testStopLossTrigger(
  page: any,
  assetPair: string,
  stopLossPrice: string,
  priceThreshold: number
): Promise<boolean> {
  return await scenarioStopLossTrigger(
    page,
    assetPair,
    stopLossPrice,
    priceThreshold
  );
}

export async function testTPSLNearPrice(
  page: any,
  assetPair: string,
  triggerType: "tp" | "sl",
  priceOffset?: number
): Promise<boolean> {
  return await scenarioTPSLNearPrice(page, assetPair, triggerType, priceOffset);
}

export async function testTPSLPriceSpike(
  page: any,
  assetPair: string,
  triggerType: "tp" | "sl"
): Promise<boolean> {
  return await scenarioTPSLPriceSpike(page, assetPair, triggerType);
}

export async function testEditTPSLNearTrigger(
  page: any,
  assetPair: string,
  triggerType: "tp" | "sl"
): Promise<boolean> {
  return await scenarioEditTPSLNearTrigger(page, assetPair, triggerType);
}
