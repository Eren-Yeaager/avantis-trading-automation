import {
  ensureOpenMarketOrder,
  ensureAppLaunched,
  getOriginalInvestedAmount,
  openEditModal,
} from "./race-condition-utils";
import { scenarioStopLoss } from "./scenarios/stop-loss.scenario";
import { scenarioTakeProfit } from "./scenarios/take-profit.scenario";
import { scenarioCollateralDeposit } from "./scenarios/collateral-deposit.scenario";
import { scenarioCollateralWithdraw } from "./scenarios/collateral-withdraw.scenario";
import { scenarioRaceCondition } from "./scenarios/race-condition.scenario";

export async function testCancelEditRaceCondition(
  page: any,
  assetPair: string,
  metamaskConfirmation?: () => Promise<void>
): Promise<boolean> {
  await ensureOpenMarketOrder(page, assetPair, metamaskConfirmation);
  await page.waitForTimeout(1000);
  await ensureAppLaunched(page);

  const originalInvested = await getOriginalInvestedAmount(page);
  console.log(`Original invested amount: ${originalInvested}`);

  const { collateralTab, tpSlTab } = await openEditModal(page);

  const results: boolean[] = [];

  console.log("\n=== Scenario 1: Stop Loss ===");
  const stopLossResult = await scenarioStopLoss(page, tpSlTab);
  results.push(stopLossResult);

  console.log("\n=== Scenario 2: Take Profit ===");
  const takeProfitResult = await scenarioTakeProfit(page, tpSlTab);
  results.push(takeProfitResult);

  console.log("\n=== Scenario 3: Collateral Deposit ===");
  const depositResult = await scenarioCollateralDeposit(
    page,
    collateralTab,
    originalInvested,
    metamaskConfirmation
  );
  results.push(depositResult);

  console.log("\n=== Scenario 4: Collateral Withdraw ===");
  const withdrawResult = await scenarioCollateralWithdraw(
    page,
    collateralTab,
    metamaskConfirmation
  );
  results.push(withdrawResult);

  console.log("\n=== Scenario 5: Race Condition ===");
  const raceConditionResult = await scenarioRaceCondition(page, tpSlTab);
  results.push(raceConditionResult);

  const verificationPassed = results.filter((r) => r === true).length > 0;
  const raceConditionHandled = raceConditionResult;

  console.log("\n=== Test Results ===");
  console.log(`Stop Loss: ${stopLossResult ? "✓" : "✗"}`);
  console.log(`Take Profit: ${takeProfitResult ? "✓" : "✗"}`);
  console.log(`Deposit: ${depositResult ? "✓" : "✗"}`);
  console.log(`Withdraw: ${withdrawResult ? "✓" : "✗"}`);
  console.log(`Race Condition: ${raceConditionResult ? "✓" : "✗"}`);

  return verificationPassed && raceConditionHandled;
}
