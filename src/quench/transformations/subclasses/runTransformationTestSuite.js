import { createTestActor } from "../../helpers/actors.js"
import { advanceStageAndChoose } from "../../helpers/adcanceStageAndExpectchoiceDialog.js"
import { advanceStageAndWait } from "../../helpers/advanceStageAndWait.js"
import { expectAsyncWork } from "../../helpers/async/expectAsyncWork.js"
import { waitForNextFrame } from "../../helpers/dom.js"
import { readyGame } from "../../helpers/setup.js"
import { waitForCondition } from "../../helpers/waitForCondition.js"
import { waitForDomainStability } from "../../helpers/waitForDomainStability.js"

export function runTransformationTestSuite({
    runtime,
    mochaFunctions,
    testDef
})
{
    const { describe, it, assert, expect } = mochaFunctions
    describe(`Transformation: ${testDef.id}`, function()
    {
        this.timeout(10_000)
        let actor
        let transformationDef

        beforeEach(async function()
        {
            await readyGame()
            actor = await createTestActor({ name: this.currentTest.title + `(${testDef.id})`, options: { race: "humanoid" } })
            transformationDef = await runtime.services.transformationQueryService.getDefinitionById(testDef.id)
            await expectAsyncWork(
                () => runtime.services.transformationService.applyTransformation(
                    actor,
                    { definition: transformationDef }
                ),
                { trackers: runtime.dependencies.utils.asyncTrackers }
            )

            await waitForCondition(() =>
                actor.getFlag("transformations", "type") === transformationDef.id
            )

            await waitForNextFrame()

            if (actor.getFlag("transformations", "stage") != 0) throw new Error("Transformation stage not set to 0 in beforeEach")
            if (actor.getFlag("transformations", "type") != transformationDef.id) throw new Error(`Transformation type not set to ${transformationDef.id} in beforeEach`)
        })

        for (const scenario of testDef.scenarios) {

            it(`Scenario: ${scenario.name}`, async function()
            {

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
