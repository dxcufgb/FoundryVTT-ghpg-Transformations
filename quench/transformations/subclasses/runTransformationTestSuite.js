import { applyItemActivityEffect, expectItemsOnActor, expectRaceItemSubTypeOnActor } from "../../helpers/actors.js"
import { actorValidators } from "../../helpers/actorValidators.js"
import { advanceStageAndChoose } from "../../helpers/adcanceStageAndExpectchoiceDialog.js"
import { advanceStageAndWait } from "../../helpers/advanceStageAndWait.js"
import { expectAsyncWork } from "../../helpers/async/expectAsyncWork.js"
import { waitForStageFinished } from "../../helpers/awaitStage.js"
import { waitForNextFrame } from "../../helpers/dom.js"
import { triggerFunction } from "../../helpers/triggers.js"
import { waitForCondition } from "../../helpers/waitForCondition.js"
import { waitForDomainStability } from "../../helpers/waitForDomainStability.js"
import { setupTest } from "../../testLifecycle.js"

export function runTransformationTestSuite({
    mochaFunctions,
    testDef
})
{

    const { describe, it, assert, expect } = mochaFunctions
    const helpers = { applyItemActivityEffect, expectItemsOnActor, expectRaceItemSubTypeOnActor, actorValidators }
    const waiters = { waitForCondition, waitForNextFrame, waitForDomainStability, waitForStageFinished }

    if (testDef.scenarios?.length > 0) {
        describe(`${testDef.id} scenarios`, function()
        {
            this.timeout(10_000)
            let actor
            let runtime
            let transformationDef

            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {
                            name: this.currentTest.title + `(${testDef.id})`, options: { race: "humanoid" }
                        },
                        runtime: {}
                    },
                    initializeTestVariables: true
                }))
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
                globalThis.___TransformationTestEnvironment___ = {}
            })

            for (const scenario of testDef.scenarios) {
                it(`Scenario: ${scenario.name}`, async function()
                {

                    if (scenario.setup) {
                        await scenario.setup({ actor, helpers, runtime })
                    }

                    for (const step of scenario.steps) {
                        if (step.trigger) {
                            await triggerFunction(runtime, step.trigger, actor)
                        }

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
                                waiters
                            })
                        }
                    }

                    if (scenario.finalAwait) {
                        await scenario.finalAwait({ runtime, actor, waiters })
                    }

                    if (scenario.finalAssertions) {
                        await scenario.finalAssertions({ runtime, actor, expect, helpers, waiters })
                    }
                })
            }
        })
    }
    if (testDef.itemBehaviorTests?.length > 0) {
        describe(`${testDef.id} items`, function()
        {
            this.timeout(10_000)
            let actor
            let runtime
            let transformationDef

            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {
                            name: this.currentTest.title + `(${testDef.id})`, options: { race: "humanoid" }
                        },
                        runtime: {}
                    },
                    initializeTestVariables: true
                }))
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
                globalThis.___TransformationTestEnvironment___ = {}
            })
            for (const behavior of testDef.itemBehaviorTests ?? []) {
                it(`Item behavior: ${behavior.name}`, async function()
                {
                    if (behavior.setup) {
                        await behavior.setup({ actor, helpers })
                    }

                    for (const step of behavior.requiredPath ?? []) {
                        if (step.choose) {
                            await advanceStageAndChoose({
                                actor,
                                stage: step.stage,
                                choiceUuid: step.choose,
                                asyncTrackers: runtime.dependencies.utils.asyncTrackers
                            })
                            await waitForStageFinished(runtime, actor, waitForCondition, step.stage)
                        } else {
                            await advanceStageAndWait({
                                actor,
                                stage: step.stage,
                                asyncTrackers: runtime.dependencies.utils.asyncTrackers
                            })
                            await waitForStageFinished(runtime, actor, waitForCondition, step.stage)
                        }

                        await waitForNextFrame()
                    }

                    // Ensure item exists on actor
                    const hasItem = actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === behavior.uuid
                    )

                    if (!hasItem) {
                        throw new Error(
                            `Item ${behavior.name} (${behavior.uuid}) not present on actor`
                        )
                    }

                    if (behavior.steps) {
                        for (const step of behavior.steps) {
                            await step({ actor, runtime, helpers, waiters })
                        }
                    }

                    if (behavior.trigger) {
                        await triggerFunction(runtime, behavior.trigger, actor)
                    }

                    if (behavior.await) {
                        await behavior.await({
                            actor,
                            runtime,
                            waiters
                        })
                    }

                    if (behavior.assertions) {
                        await behavior.assertions({ actor, expect, runtime, helpers })
                    }
                })
            }
        })
    }
    if (testDef.rollTableEffects?.length > 0) {
        describe(`${testDef.id} roll table effects`, function()
        {
            this.timeout(10_000)
            let actor
            let runtime
            let transformationDef

            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {
                            name: this.currentTest.title + `(${testDef.id})`, options: { race: "humanoid" }
                        },
                        runtime: {}
                    },
                    initializeTestVariables: true
                }))
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
                globalThis.___TransformationTestEnvironment___ = {}
            })
            for (const effectTest of testDef.rollTableEffects ?? []) {
                it(`Roll Table Effect: ${effectTest.name}`, async function()
                {
                    if (effectTest.setup) {
                        await effectTest.setup({ actor, helpers })
                    }
                    const effect = game.transformations.getEffectInstance(actor, effectTest.key)
                    await effect.apply(actor)
                    await effectTest.assertion({ name: effectTest.name, origin: testDef.rollTableOrigin, actor, assert, helpers })
                })
            }
        })
    }
}
