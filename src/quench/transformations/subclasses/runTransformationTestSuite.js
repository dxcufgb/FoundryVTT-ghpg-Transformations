import { createTestActor } from "../../helpers/actors.js"
import { advanceStageAndChoose } from "../../helpers/adcanceStageAndExpectchoiceDialog.js"
import { advanceStageAndWait } from "../../helpers/advanceStageAndWait.js"
import { waitForNextFrame } from "../../helpers/dom.js"
import { readyGame } from "../../helpers/setup.js"
import { waitForCondition } from "../../helpers/waitForCondition.js"
import { waitForDomainStability } from "../../helpers/waitForDomainStability.js"

export function runTransformationTestSuite({
    runtime,
    mochaFunctions,
    transformationDef,
    testDef
})
{
    const { describe, it, assert, expect } = mochaFunctions
    describe(`Transformation: ${testDef.id}`, function()
    {
        this.timeout(10_000)
        let actor

        beforeEach(async function()
        {
            await readyGame()
            actor = await createTestActor()
            await runtime.services.transformationService.applyTransformation(
                actor,
                { definition: transformationDef }
            )
        })

        for (const scenario of testDef.scenarios) {

            it(`Scenario: ${scenario.name}`, async function()
            {

                const actor = await createTestActor()

                await runtime.services.transformationService.applyTransformation(actor, { definition: transformationDef })

                if (scenario.setup) {
                    await scenario.setup({ actor })
                }

                for (const step of scenario.steps) {

                    if (step.adjust) {
                        await step.adjust({ actor })
                    }

                    if (step.choose) {
                        await advanceStageAndChoose({
                            actor,
                            stage: step.stage,
                            choiceUuid: step.choose,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                    } else {
                        await advanceStageAndWait({
                            actor,
                            stage: step.stage,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                    }
                    if (step.await) {
                        await step.await({
                            runtime,
                            actor,
                            waitForCondition
                        })
                    }
                }

                if (scenario.finalAwait) {
                    await scenario.finalAwait({ runtime, actor, waitForCondition })
                }

                if (scenario.finalAssertions) {
                    await scenario.finalAssertions({ runtime, actor, expect })
                }
            })
        }

        // Item behavior tests
        for (const [uuid, behavior] of Object.entries(testDef.itemBehaviorTests ?? {})) {
            it(`verifies behavior of ${uuid}`, async function()
            {

                await behavior.test({ actor })
            })
        }
    })
}
