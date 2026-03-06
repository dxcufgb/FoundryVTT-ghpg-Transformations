import { applyItemActivityEffect, expectItemsOnActor, expectRaceItemSubTypeOnActor, validateAllD20Disadvantage } from "../../helpers/actors.js"
import { advanceStageAndChoose } from "../../helpers/adcanceStageAndExpectchoiceDialog.js"
import { advanceStageAndWait } from "../../helpers/advanceStageAndWait.js"
import { expectAsyncWork } from "../../helpers/async/expectAsyncWork.js"
import { waitForStageFinished } from "../../helpers/awaitStage.js"
import { waitForElement, waitForElementGone, waitForNextFrame } from "../../helpers/dom.js"
import { chooseDamageResistanceOnLongRest } from "../../helpers/fey/chooseDamageResistanceOnLongRest.js"
import { getPreRollSavingThrowContext } from "../../helpers/foundryObjecStructures/preRollSavingThrowContext.js"
import { triggerFunction } from "../../helpers/triggers.js"
import { waitForCondition } from "../../helpers/waitForCondition.js"
import { waitForDomainStability } from "../../helpers/waitForDomainStability.js"
import { setupTest } from "../../testLifecycle.js"
// import { ActivityDTOValidator } from "../../helpers/DTOValidators/ActivityDTOValidator.js"
// import { ActorDTOValidator } from "../../helpers/DTOValidators/ActorDTOValidator.js"
// import { ConsumptionTargetDTOValidator } from "../../helpers/DTOValidators/ConsumptionTargetDTOValidator.js"
// import { ContextDTOValidator } from "../../helpers/DTOValidators/ContextDTOValidator.js"
// import { DamagePartDTOValidator } from "../../helpers/DTOValidators/DamagePartDTOValidator.js"
// import { EffectDTOValidator } from "../../helpers/DTOValidators/EffectDTOValidator.js"
// import { ItemDTOValidator } from "../../helpers/DTOValidators/ItemDTOValidator.js"
// import { MessageDTOValidator } from "../../helpers/DTOValidators/MessageDTOValidator.js"

export function runTransformationTestSuite({
    mochaFunctions,
    testDef
})
{

    const { describe, it, assert, expect } = mochaFunctions
    const helpers = {
        applyItemActivityEffect,
        expectItemsOnActor,
        expectRaceItemSubTypeOnActor,
        validateAllD20Disadvantage,
        getPreRollSavingThrowContext,
        fey: {
            chooseDamageResistanceOnLongRest
        }
    }
    const waiters = {
        waitForCondition,
        waitForNextFrame,
        waitForDomainStability,
        waitForStageFinished,
        waitForElementGone,
        waitForElement
    }
    const validators = {
        // activity: ({ assert, strict = true }) => new ActivityDTOValidator({ assert, path: "activity", strict }),
        // actor: ({ assert, strict = true }) => new ActorDTOValidator({ assert, path: "actor", strict }),
        // consumptionTarget:({ assert, strict = true }) => new ConsumptionTargetDTOValidator({ assert, path: "consumptionTarget", strict }),
        // context: ({ assert, strict = true }) => new ContextDTOValidator({ assert, path: "context", strict }),
        // damagePart:({ assert, strict = true }) => new DamagePartDTOValidator({ assert, path: "damagePart", strict }),
        // effect: ({ assert, strict = true }) => new EffectDTOValidator({ assert, path: "effect", strict }),
        // item: ({ assert, strict = true }) => new ItemDTOValidator({ assert, path: "item", strict }),
        // message: ({ assert, strict = true }) => new MessageDTOValidator({ assert, path: "message", strict })
    }

    if (testDef.scenarios?.length > 0) {
        describe(`${testDef.id} scenarios`, function()
        {
            this.timeout(10_000)
            let actor
            let runtime
            let transformationDef
            let staticVars = {}

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
                staticVars = {}
            })

            for (const scenario of testDef.scenarios) {

                const loopContexts = scenario.loop
                    ? scenario.loop({ game, actor, helpers, runtime, staticVars })
                    : [undefined]

                for (const loopVars of loopContexts) {

                    const testName =
                        typeof scenario.name === "function"
                            ? scenario.name(loopVars)
                            : scenario.loop && loopVars
                                ? `${scenario.name} [${formatLoopVars(loopVars)}]`
                                : scenario.name

                    it(`Scenario: ${testName}`, async function()
                    {

                        if (scenario.setup) {
                            await scenario.setup({ game, actor, helpers, runtime, staticVars, loopVars })
                        }

                        for (const step of scenario.steps) {
                            if (step.trigger) {
                                await triggerFunction(runtime, step.trigger, actor, staticVars, loopVars)
                            }

                            if (step.adjust) {
                                await step.adjust({ actor, staticVars, loopVars })
                            }

                            if (step.choose) {
                                await advanceStageAndChoose({
                                    actor,
                                    stage: step.stage,
                                    choiceUuid: typeof step.choose === "function"
                                        ? step.choose(loopVars)
                                        : step.choose,
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
                                    waiters,
                                    staticVars,
                                    loopVars
                                })
                            }
                        }

                        if (scenario.finalAwait) {
                            await scenario.finalAwait({ runtime, actor, waiters, staticVars, loopVars })
                        }

                        if (scenario.finalAssertions) {
                            await scenario.finalAssertions({
                                runtime,
                                actor,
                                expect,
                                assert,
                                helpers,
                                waiters,
                                staticVars,
                                loopVars,
                                validators
                            })
                        }
                    })
                }
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

                const loopContexts = behavior.loop
                    ? behavior.loop({ actor, helpers, runtime })
                    : [undefined]

                for (const loopVars of loopContexts) {

                    const testName =
                        typeof behavior.name === "function"
                            ? behavior.name(loopVars)
                            : behavior.loop && loopVars
                                ? `${behavior.name} [${formatLoopVars(loopVars)}]`
                                : behavior.name

                    it(`Item behavior: ${testName}`, async function()
                    {

                        if (behavior.setup) {
                            await behavior.setup({ actor, helpers, loopVars })
                        }

                        for (const step of behavior.requiredPath ?? []) {

                            const choiceUuid =
                                typeof step.choose === "function"
                                    ? step.choose(loopVars)
                                    : step.choose

                            if (choiceUuid) {
                                await advanceStageAndChoose({
                                    actor,
                                    stage: step.stage,
                                    choiceUuid,
                                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                                })
                            } else {
                                await advanceStageAndWait({
                                    actor,
                                    stage: step.stage,
                                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                                })
                            }

                            await waitForStageFinished(runtime, actor, waitForCondition, step.stage)
                            await waitForNextFrame()
                        }

                        const expectedUuid =
                            typeof behavior.uuid === "function"
                                ? behavior.uuid(loopVars)
                                : behavior.uuid

                        const hasItem = actor.items.some(i =>
                            i.flags?.transformations?.sourceUuid === expectedUuid
                        )

                        if (!hasItem) {
                            throw new Error(
                                `Item ${behavior.name} (${expectedUuid}) not present on actor`
                            )
                        }

                        if (behavior.steps) {
                            for (const step of behavior.steps) {
                                await step({ actor, runtime, helpers, waiters, loopVars })
                            }
                        }

                        if (behavior.trigger) {
                            const triggerValue =
                                typeof behavior.trigger === "function"
                                    ? behavior.trigger(loopVars)
                                    : behavior.trigger

                            await triggerFunction(runtime, triggerValue, actor)
                        }

                        if (behavior.await) {
                            await behavior.await({
                                actor,
                                runtime,
                                waiters,
                                loopVars
                            })
                        }

                        if (behavior.assertions) {
                            await behavior.assertions({
                                actor,
                                expect,
                                assert,
                                runtime,
                                helpers,
                                loopVars,
                                validators
                            })
                        }
                    })
                }
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
                    await effectTest.assertion({ name: effectTest.name, origin: testDef.rollTableOrigin, actor, assert, helpers, validators })
                })
            }
        })
    }
}
