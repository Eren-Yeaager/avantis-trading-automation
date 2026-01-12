import { scenarioCancelLimitBeforeExecution } from "./scenarios/limit/cancel-before-execution.scenario";
import { scenarioEditLimitPriceRapidly } from "./scenarios/limit/edit-price-rapidly.scenario";

export async function testCancelLimitBeforeExecution(
  page: any,
  assetPair: string
): Promise<boolean> {
  return await scenarioCancelLimitBeforeExecution(page, assetPair);
}

export async function testEditLimitPriceRapidly(
  page: any,
  assetPair: string
): Promise<boolean> {
  return await scenarioEditLimitPriceRapidly(page, assetPair);
}
