import { testWithSynpress } from "@synthetixio/synpress";
import { getExtensionId, MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import connectedSetup from "../../wallet-setup/connected.setup";
import { testCancelEditRaceCondition } from "../helpers/race-condition-tests";
import { REGRESSION_SCENARIOS } from "../regression-config";

const testCon = testWithSynpress(metaMaskFixtures(connectedSetup));

const raceConditionScenarios = REGRESSION_SCENARIOS.filter(
    s => s.category === 'race-condition'
);

for (const config of raceConditionScenarios) {
    testCon(
        config.testName,
        async ({ context, page, metamaskPage, extensionId }) => {
            const metamask = new MetaMask(context, metamaskPage, "Tester@1234", extensionId);

            await metamask.page.mouse.click(10, 10);
            await page.waitForTimeout(500);
            await page.getByText("Launch App").first().click();
            await page.waitForTimeout(2000);

            const result = await testCancelEditRaceCondition(page, config.assetPair);
            expect(result).toBe(true);
        }
    );
}
