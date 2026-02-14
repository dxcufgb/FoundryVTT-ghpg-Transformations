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

                for (const step of scenario.steps) {

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
                    await waitForCondition(() =>
                        actor.getFlag("transformations", "stage") === step.stage
                    )
                    await waitForCondition(() =>
                        actor.items.some(i => i.flags?.transformations?.stage === step.stage)
                    )
                    await waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                }

                if (scenario.finalAssertions) {
                    await scenario.finalAssertions({ actor, expect })
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
