import { wait } from "../helpers/wait.js"
import { advanceStageAndWait } from "../helpers/advanceStageAndWait.js"
import { advanceStageAndChoose } from "../helpers/adcanceStageAndExpectchoiceDialog.js"
import { waitForCondition } from "../helpers/waitForCondition.js"
import { conditionsMet } from "../../domain/actions/conditionSchema.js"
import { waitForDomainStability } from "../helpers/waitForDomainStability.js"
import { setupTest, teardownAllTest, tearDownEachTest } from "../testLifecycle.js"

quench.registerBatch(
    "transformations.actions",
    ({ describe, it, assert, expect }) =>
    {
        let actor
        let runtime
        let transformationDef
        let actionExecutor
        let actionHandlers

        const existingActorIds = game.actors.map(actor => actor.id)
        async function localSetupTest(currentTest, transformationId)
        {
            ({ actor, runtime, actionExecutor, actionHandlers } = await setupTest({
                currentTest,
                createObjects: {
                    actor: { name: currentTest.title + `(${transformationId})`, options: { race: "humanoid" } },
                    runtime: {},
                    actionExecutor: {},
                    actionHandlers: {}
                },
                initializeTestVariables: true
            }))
            transformationDef = await runtime.services.transformationQueryService.getDefinitionById(transformationId)
        }

        after(async function()
        {
            await wait(200)
            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
                .filter(actor => !existingIdSet.has(actor.id))
                .map(actor => actor.id)

            await teardownAllTest(testActorIds)
        })
        describe("Transformation Actions", function()
        {
            this.timeout(10_000)
            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownEachTest()
            })
            it("executes handlers sequentially in order", async function()
            {

                const calls = []

                const handlers = {
                    TEST: async ({ action }) =>
                    {
                        calls.push(action.id)
                    }
                }

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "order-test",
                            actions: [
                                { id: 1, type: "TEST" },
                                { id: 2, type: "TEST" }
                            ]
                        }
                    ],
                    handlers
                })


                expect(calls).to.deep.equal([1, 2])
            })

            it("skips action when conditions are not met", async function()
            {
                let called = false

                const handlers = {
                    TEST: async () => { called = true }
                }

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "condition-test",
                            actions: [{
                                type: "TEST",
                                when: { actor: { hasSpellSlots: true } }
                            }]
                        }
                    ],
                    handlers
                })

                expect(called).to.equal(false)
            })

            it("skips action when handler missing", async function()
            {

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "missing-handler",
                            actions: [{ type: "UNKNOWN" }]
                        }
                    ],
                    handlers: {}
                })

                // Just assert no crash
            })

            it("conditionsMet detects spell slots correctly", function()
            {

                actor.system.spells = {
                    spell1: { max: 2 }
                }

                const result = conditionsMet(actor, {
                    actor: { hasSpellSlots: true }
                })

                expect(result).to.equal(true)
            })
            it("executes actions in declared order", async function()
            {
                const callOrder = []

                const handlers = {
                    FIRST: async () => callOrder.push("FIRST"),
                    SECOND: async () => callOrder.push("SECOND"),
                    THIRD: async () => callOrder.push("THIRD"),
                }

                const actions = [
                    { type: "FIRST" },
                    { type: "SECOND" },
                    { type: "THIRD" }
                ]

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "order-group",
                            actions
                        }
                    ],
                    context: {},
                    variables: {},
                    handlers
                })


                expect(callOrder).to.deep.equal([
                    "FIRST",
                    "SECOND",
                    "THIRD"
                ])
            })
            it("stops executing further actions if a handler throws", async function()
            {
                const callOrder = []

                const handlers = {
                    FIRST: async () => callOrder.push("FIRST"),
                    FAIL: async () =>
                    {
                        callOrder.push("FAIL")
                        throw new Error("boom")
                    },
                    NEVER: async () => callOrder.push("NEVER")
                }

                const actions = [
                    { type: "FIRST" },
                    { type: "FAIL" },
                    { type: "NEVER" }
                ]

                let errorCaught = false

                try {
                    await actionExecutor.execute({
                        actorId: actor.id,
                        actionGroups: [
                            {
                                name: "throw-test",
                                actions
                            }
                        ],
                        context: {},
                        variables: {},
                        handlers
                    })

                } catch {
                    errorCaught = true
                }

                expect(errorCaught).to.equal(true)

                expect(callOrder).to.deep.equal([
                    "FIRST",
                    "FAIL"
                ])
            })

            it("does not duplicate an effect when action runs twice", async function()
            {
                const effectName = "Test Effect"

                const actions = [
                    {
                        type: "EFFECT",
                        data: {
                            mode: "apply",
                            name: effectName
                        }
                    }
                ]

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "effect-test",
                            actions
                        }
                    ],
                    context: {},
                    variables: {},
                    handlers: actionHandlers
                })


                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "effect-test",
                            actions
                        }
                    ],
                    context: {},
                    variables: {},
                    handlers: actionHandlers
                })


                const matchingEffects = actor.effects.filter(e => e.name === effectName)

                expect(matchingEffects.length).to.equal(1)
            })

            it("stops executing remaining actions in group when blocker returns false", async function()
            {

                const calls = []

                const handlers = {
                    FIRST: async () =>
                    {
                        calls.push("FIRST")
                        return false // simulate failed consume
                    },
                    SECOND: async () =>
                    {
                        calls.push("SECOND")
                    }
                }

                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups: [
                        {
                            name: "blocker-test",
                            actions: [
                                { type: "FIRST", data: { blocker: true } },
                                { type: "SECOND" }
                            ]
                        }
                    ],
                    handlers
                })

                expect(calls).to.deep.equal(["FIRST"])
            })

            it("executes once-only action only a single time", async function()
            {
                let callCount = 0

                const handlers = {
                    TEST: async () =>
                    {
                        callCount++
                    }
                }

                const actionGroups = [
                    {
                        name: "once-test",
                        actions: [
                            {
                                type: "TEST",
                                once: {
                                    key: "once-key",
                                    reset: "longRest"
                                }
                            }
                        ]
                    }
                ]

                // First execution
                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups,
                    context: {},
                    variables: {},
                    handlers
                })

                // Second execution (should be ignored)
                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups,
                    context: {},
                    variables: {},
                    handlers
                })

                expect(callCount).to.equal(1)
            })

            it("resets once-only action on long rest", async function()
            {
                let callCount = 0

                const handlers = {
                    TEST: async () =>
                    {
                        callCount++
                    }
                }

                const actionGroups = [
                    {
                        name: "once-reset-test",
                        actions: [
                            {
                                type: "TEST",
                                once: {
                                    key: "once-reset-key",
                                    reset: ["longRest"]
                                }
                            }
                        ]
                    }
                ]

                // First execution
                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups,
                    context: {},
                    variables: {},
                    handlers
                })

                expect(callCount).to.equal(1)

                // Simulate long rest
                await actor.update({
                    "system.attributes.hp.value": actor.system.attributes.hp.max
                })

                Hooks.call("dnd5e.restCompleted", actor, { longRest: true })

                await waitForCondition(() =>
                    actor.getFlag("transformations", "once") == null
                )

                // Execute again after reset
                await actionExecutor.execute({
                    actorId: actor.id,
                    actionGroups,
                    context: {},
                    variables: {},
                    handlers
                })

                expect(callCount).to.equal(2)
            })

            it("full aberrant horror journey behaves correctly", async function()
            {
                globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                let chatCallCount = 0

                const originalCreate = ChatMessage.create

                ChatMessage.create = async function(...args)
                {
                    chatCallCount++
                    return originalCreate.apply(this, args)
                }

                const STAGE2_UUID = "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                await runtime.services.transformationService.applyTransformation(actor, {
                    definition: transformationDef
                })

                await advanceStageAndWait({ actor, stage: 1, asyncTrackers: runtime.dependencies.utils.asyncTrackers })
                await advanceStageAndChoose({ actor, stage: 2, choiceUuid: STAGE2_UUID, asyncTrackers: runtime.dependencies.utils.asyncTrackers })
                await advanceStageAndWait({ actor, stage: 3, asyncTrackers: runtime.dependencies.utils.asyncTrackers })
                await advanceStageAndWait({ actor, stage: 4, asyncTrackers: runtime.dependencies.utils.asyncTrackers })

                await waitForDomainStability({ actor, asyncTrackers: runtime.dependencies.utils.asyncTrackers })

                // Simulate bloodied
                await actor.update({
                    "system.attributes.hp.value": Math.floor(actor.system.attributes.hp.max / 2)
                })

                await waitForCondition(() =>
                    actor.system.attributes.hp.temp > 0
                )

                const tempHpAfterFirst = actor.system.attributes.hp.temp
                expect(tempHpAfterFirst).to.be.equal(5)

                // Heal
                await actor.update({
                    "system.attributes.hp.value": actor.system.attributes.hp.max,
                    "system.attributes.hp.temp": 0
                })

                await waitForCondition(() =>
                    actor.system.attributes.hp.temp == 0
                )

                // Damage again below half
                await actor.update({
                    "system.attributes.hp.value": Math.floor(actor.system.attributes.hp.max / 2)
                })

                await waitForCondition(() =>
                    actor.system.attributes.hp.value < Math.floor(actor.system.attributes.hp.max / 2) + 1
                )

                const tempHpAfterSecond = actor.system.attributes.hp.temp

                expect(tempHpAfterSecond).to.equal(0)
                expect(chatCallCount).to.equal(1)
            })
        })

    }
)
