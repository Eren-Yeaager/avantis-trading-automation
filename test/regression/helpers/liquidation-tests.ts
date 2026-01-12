import { scenarioForceLiquidationByCollateral } from "./scenarios/liquidation/force-by-collateral.scenario";
import { scenarioSimulatedPriceMovement } from "./scenarios/liquidation/simulated-price-movement.scenario";

export async function testForceLiquidationByCollateral(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  return await scenarioForceLiquidationByCollateral(
    page,
    assetPair,
    metamaskConfirmation
  );
}

export async function testSimulatedPriceMovement(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  return await scenarioSimulatedPriceMovement(
    page,
    assetPair,
    metamaskConfirmation
  );
}
