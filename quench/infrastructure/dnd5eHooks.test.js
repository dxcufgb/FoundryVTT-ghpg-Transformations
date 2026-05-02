import { registerDnd5eHooks } from "../../infrastructure/hooks/dnd5eHooks.js"
import { Lycanthrope } from "../../domain/transformation/subclasses/lycanthrope/Lycanthrope.js"
import { Primordial } from "../../domain/transformation/subclasses/primordial/Primordial.js"
import { Seraph } from "../../domain/transformation/subclasses/seraph/Seraph.js"
import { onPreRollDamage as shadowsteelGhoulOnPreRollDamage } from "../../domain/transformation/subclasses/shadowsteelGhoul/triggers/onPreRollDamage.js"
import { BLINDING_RADIANCE_ACTIVITY_ID } from "../../domain/transformation/subclasses/seraph/Feats/BlindingRadiance.js"
import { BLINDING_RADIANCE_UUID } from "../../domain/transformation/subclasses/seraph/triggers/blindingRadianceTriggerCommon.js"

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

function createActor()
{
    return {
        id: "actor-1",
        getFlag() {
            return false
        }
    }
}

function createRoll({
    natural = 1,
    total = natural,
    isSuccess = false
} = {})
{
    return {
        total,
        isSuccess,
        dice: [
            {
                faces: 20,
                results: [
                    {active: false, result: 20},
                    {active: true, result: natural}
                ]
            }
        ]
    }
}

async function flushAsyncWork()
{
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
}

function createHookHarness({transformationOverrides = {}} = {})
{
    const originalHooks = globalThis.Hooks
    const callbacks = new Map()
    const calls = {
        onRoll: [],
        triggerRuntime: [],
        pulses: []
    }

    globalThis.Hooks = {
        on(name, callback)
        {
            callbacks.set(name, callback)
        }
    }

    const transformation = {
        TransformationClass: {
            onPreRollHitDie() {},
            async onPreRollSavingThrow() {},
            async onRoll(actor, roll)
            {
                calls.onRoll.push({actor, roll})
            }
        },
        ...transformationOverrides
    }

    registerDnd5eHooks({
        transformationService: {},
        transformationRegistry: {
            getEntryForActor()
            {
                return transformation
            }
        },
        actorRepository: {},
        dialogFactory: {},
        triggerRuntime: {
            async run(name, actor, data)
            {
                calls.triggerRuntime.push({name, actor, data})
            }
        },
        onceService: {
            resetFlagsOnRest() {}
        },
        tracker: {
            track(promise)
            {
                return promise
            }
        },
        debouncedTracker: {
            pulse(name)
            {
                calls.pulses.push(name)
            }
        },
        ChatMessagePartInjector: {},
        RollService: {},
        logger: createLogger()
    })

    return {
        calls,
        callbacks,
        restore()
        {
            globalThis.Hooks = originalHooks
        }
    }
}

quench.registerBatch(
    "transformations.infrastructure.dnd5eHooks",
    ({describe, it, expect}) =>
    {
        describe("registerDnd5eHooks", function ()
        {
            it("captures all supported d20 roll results for transformation onRoll hooks", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness()

                try {
                    const scenarios = [
                        {
                            hookName: "dnd5e.rollAbilityCheck",
                            args: [
                                [createRoll({natural: 2, total: 7})],
                                {subject: actor, ability: "str"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollSavingThrow",
                            args: [
                                [createRoll({natural: 3, total: 8, isSuccess: true})],
                                {subject: actor, ability: "wis"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollSkill",
                            args: [
                                [createRoll({natural: 4, total: 9})],
                                {subject: actor, ability: "dex", skill: "ste"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollToolCheck",
                            args: [
                                [createRoll({natural: 5, total: 10})],
                                {subject: actor, tool: "thief"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollAttack",
                            args: [
                                [createRoll({natural: 6, total: 11})],
                                {subject: {item: {actor}}}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollConcentration",
                            args: [
                                [createRoll({natural: 7, total: 12})],
                                {subject: actor}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollDeathSave",
                            args: [
                                [createRoll({natural: 8, total: 13})],
                                {subject: actor}
                            ]
                        },
                        {
                            hookName: "dnd5e.preRollInitiative",
                            args: [
                                actor,
                                createRoll({natural: 9, total: 14})
                            ]
                        }
                    ]

                    for (const scenario of scenarios) {
                        const callback = harness.callbacks.get(scenario.hookName)
                        expect(callback).to.be.a("function")
                        callback(...scenario.args)
                    }

                    await flushAsyncWork()

                    const actualOnRollCalls =
                              harness.calls.onRoll.map(({actor: rolledActor, roll}) => ({
                                  actorId: rolledActor.id,
                                  hookName: roll.hookName,
                                  natural: roll.natural,
                                  total: roll.total
                              }))

                    const expectedOnRollCalls = [
                        {actorId: "actor-1", hookName: "dnd5e.rollAbilityCheck", natural: 2, total: 7},
                        {actorId: "actor-1", hookName: "dnd5e.rollSavingThrow", natural: 3, total: 8},
                        {actorId: "actor-1", hookName: "dnd5e.rollSkill", natural: 4, total: 9},
                        {actorId: "actor-1", hookName: "dnd5e.rollToolCheck", natural: 5, total: 10},
                        {actorId: "actor-1", hookName: "dnd5e.rollAttack", natural: 6, total: 11},
                        {actorId: "actor-1", hookName: "dnd5e.rollConcentration", natural: 7, total: 12},
                        {actorId: "actor-1", hookName: "dnd5e.rollDeathSave", natural: 8, total: 13},
                        {actorId: "actor-1", hookName: "dnd5e.preRollInitiative", natural: 9, total: 14}
                    ]

                    expect(actualOnRollCalls).to.have.length(expectedOnRollCalls.length)
                    expect(actualOnRollCalls).to.have.deep.members(expectedOnRollCalls)
                } finally {
                    harness.restore()
                }
            })

            it("does not double-process the same skill roll across rollSkill hook aliases", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness()

                try {
                    const roll = createRoll({natural: 1, total: 5})
                    const context = {
                        subject: actor,
                        ability: "wis",
                        skill: "ins"
                    }

                    harness.callbacks.get("dnd5e.rollSkill")([roll], context)
                    harness.callbacks.get("dnd5e.rollSkillV2")([roll], context)

                    await flushAsyncWork()

                    expect(harness.calls.onRoll).to.have.length(1)
                    expect(
                        harness.calls.triggerRuntime.filter(call => call.name === "skillCheck")
                    ).to.have.length(1)
                } finally {
                    harness.restore()
                }
            })

            it("includes originating item data when dispatching saving throw trigger context", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness()
                const sourceUuid =
                          "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU"
                const item = {
                    id: "item-1",
                    name: "Hideous Appearance",
                    uuid: "Actor.actor-1.Item.item-1",
                    flags: {
                        transformations: {
                            sourceUuid
                        }
                    }
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.rollSavingThrow")
                    expect(callback).to.be.a("function")

                    callback(
                        [createRoll({natural: 2, total: 7, isSuccess: false})],
                        {
                            subject: actor,
                            ability: "wis",
                            workflow: {
                                item
                            }
                        }
                    )

                    await flushAsyncWork()

                    const savingThrowCall =
                              harness.calls.triggerRuntime.find(call =>
                                  call.name === "savingThrow"
                              )

                    expect(savingThrowCall).to.exist
                    expect(savingThrowCall.data?.saves?.current?.item).to.deep.equal({
                        id: "item-1",
                        name: "Hideous Appearance",
                        uuid: "Actor.actor-1.Item.item-1",
                        sourceUuid
                    })
                } finally {
                    harness.restore()
                }
            })

            it("includes activity and item data when dispatching pre-roll damage trigger context", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness()
                const sourceUuid =
                          "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                const activity = {
                    damage: {
                        parts: [
                            {
                                types: new Set(["slashing"])
                            }
                        ]
                    }
                }
                const item = {
                    id: "item-2",
                    name: "Memori Lichdom",
                    uuid: "Actor.actor-1.Item.item-2",
                    flags: {
                        transformations: {
                            sourceUuid
                        }
                    }
                }
                const rolls = [{options: {types: []}}]
                const workflow = {
                    actor,
                    item,
                    activity
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.preRollDamageV2")
                    expect(callback).to.be.a("function")

                    callback({
                        workflow,
                        rolls
                    })

                    await flushAsyncWork()

                    const preRollDamageCall =
                              harness.calls.triggerRuntime.find(call =>
                                  call.name === "preRollDamage"
                              )

                    expect(preRollDamageCall).to.exist
                    expect(preRollDamageCall.data?.damage?.current?.item).to.deep.equal({
                        id: "item-2",
                        name: "Memori Lichdom",
                        uuid: "Actor.actor-1.Item.item-2",
                        sourceUuid
                    })
                    expect(preRollDamageCall.data?.damage?.current?.activity).to.equal(activity)
                    expect(preRollDamageCall.data?.damage?.current?.workflow).to.equal(workflow)
                    expect(preRollDamageCall.data?.damage?.current?.rolls).to.equal(rolls)
                } finally {
                    harness.restore()
                }
            })

            it("dispatches transformation class pre-roll damage hooks from preRollDamageV2", async function ()
            {
                const actor = createActor()
                const item = {
                    id: "item-vampire-bite",
                    name: "Fanged Bite",
                    uuid: "Actor.actor-1.Item.item-vampire-bite"
                }
                const activity = {
                    id: "activity-vampire-bite",
                    name: "Midi Attack"
                }
                const rolls = [
                    {
                        formula: "1d6 + 1"
                    }
                ]
                const workflow = {
                    actor,
                    item,
                    activity
                }
                const capturedCalls = []
                const harness = createHookHarness({
                    transformationOverrides: {
                        TransformationClass: {
                            async onPreRollDamage(args)
                            {
                                capturedCalls.push(args)
                            }
                        }
                    }
                })

                try {
                    const callback = harness.callbacks.get("dnd5e.preRollDamageV2")
                    expect(callback).to.be.a("function")

                    callback({
                        workflow,
                        rolls
                    }, {id: "dialog-1"}, {id: "message-1"})

                    await flushAsyncWork()

                    expect(capturedCalls).to.have.length(1)
                    expect(capturedCalls[0]?.actor).to.equal(actor)
                    expect(capturedCalls[0]?.item).to.equal(item)
                    expect(capturedCalls[0]?.activity).to.equal(activity)
                    expect(capturedCalls[0]?.workflow).to.equal(workflow)
                    expect(capturedCalls[0]?.rolls).to.equal(rolls)
                    expect(capturedCalls[0]?.dialog).to.deep.equal({
                        id: "dialog-1"
                    })
                    expect(capturedCalls[0]?.message).to.deep.equal({
                        id: "message-1"
                    })
                } finally {
                    harness.restore()
                }
            })

            it("dispatches activityUse trigger context from postUseActivity", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness()
                const item = {
                    id: "item-3",
                    name: "Elemental Surge",
                    uuid: "Actor.actor-1.Item.item-3",
                    type: "feat",
                    system: {
                        type: {
                            value: "transformation",
                            subtype: "primordial"
                        }
                    },
                    flags: {
                        transformations: {
                            sourceUuid:
                                "Compendium.transformations.gh-transformations.Item.pf2FTD9AFlTvmeDU"
                        }
                    }
                }
                const activity = {
                    id: "activity-1",
                    name: "Lightning Strike",
                    type: "attack"
                }
                const usage = {
                    workflow: {
                        actor,
                        item
                    }
                }
                const changes = {
                    message: {
                        id: "message-1"
                    }
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.postUseActivity")
                    expect(callback).to.be.a("function")

                    await callback(activity, usage, changes)

                    const activityUseCall =
                              harness.calls.triggerRuntime.find(call =>
                                  call.name === "activityUse"
                              )

                    expect(activityUseCall).to.exist
                    expect(activityUseCall.actor).to.equal(actor)
                    expect(activityUseCall.data?.activities?.current?.activity).to.deep.equal({
                        id: "activity-1",
                        name: "Lightning Strike",
                        type: "attack"
                    })
                    expect(activityUseCall.data?.activities?.current?.item).to.deep.equal({
                        id: "item-3",
                        name: "Elemental Surge",
                        uuid: "Actor.actor-1.Item.item-3",
                        sourceUuid:
                            "Compendium.transformations.gh-transformations.Item.pf2FTD9AFlTvmeDU",
                        type: "feat",
                        systemType: "transformation",
                        systemSubType: "primordial"
                    })
                } finally {
                    harness.restore()
                }
            })

            it(
                "delegates preUseActivity to the transformation class and applies Roiling Elements stage DC for actor activities",
                async function ()
                {
                    const actor = {
                        id: "actor-2",
                        flags: {
                            transformations: {
                                stage: 3
                            }
                        },
                        getFlag(scope, key)
                        {
                            if (scope === "transformations" && key === "stage") {
                                return 3
                            }

                            return null
                        }
                    }
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: Primordial
                        }
                    })
                    let persistedUpdate = null
                    const item = {
                        id: "item-5",
                        name: "Roiling Elements",
                        uuid: "Actor.actor-2.Item.item-5",
                        system: {
                            activities: {
                                get(id)
                                {
                                    return id === "CeVayhK6VQsMSFY8"
                                        ? activity
                                        : null
                                }
                            }
                        },
                        flags: {
                            transformations: {
                                sourceUuid:
                                    "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2"
                            }
                        },
                        updateSource(update)
                        {
                            persistedUpdate = update
                        }
                    }
                    const activity = {
                        id: "CeVayhK6VQsMSFY8",
                        uuid:
                            "Actor.actor-2.Item.item-5.Activity.CeVayhK6VQsMSFY8",
                        actor,
                        item,
                        save: {
                            dc: {
                                calculation: "",
                                formula: ""
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: ""
                                }
                            }
                        }
                    }
                    const usageConfig = {}
                    const dialogConfig = {
                        dc: {
                            value: 0
                        }
                    }
                    const messageConfig = {}

                    try {
                        const callback = harness.callbacks.get("dnd5e.preUseActivity")
                        expect(callback).to.be.a("function")

                        callback(activity, usageConfig, dialogConfig, messageConfig)

                        await flushAsyncWork()

                        expect(activity.save.dc.formula).to.equal("16")
                        expect(activity.save.dc.value).to.equal(16)
                        expect(activity.system.save.dc.formula).to.equal("16")
                        expect(activity.system.save.dc.value).to.equal(16)
                        expect(activity.labels.save.trim()).to.equal("DC 16")
                        expect(dialogConfig.dc.value).to.equal(16)
                        expect(messageConfig.dc.value).to.equal(16)
                        expect(persistedUpdate).to.deep.equal({
                            "system.activities.CeVayhK6VQsMSFY8.save.dc.calculation": "",
                            "system.activities.CeVayhK6VQsMSFY8.save.dc.formula": "16"
                        })
                    } finally {
                        harness.restore()
                    }
                }
            )

            it(
                "delegates preActivityUse to the transformation class and applies Roiling Elements stage DC",
                async function ()
                {
                    const actor = {
                        id: "actor-3",
                        flags: {
                            transformations: {
                                stage: 4
                            }
                        },
                        getFlag(scope, key)
                        {
                            if (scope === "transformations" && key === "stage") {
                                return 4
                            }

                            return null
                        }
                    }
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: Primordial
                        }
                    })
                    let persistedUpdate = null
                    const item = {
                        id: "item-6",
                        name: "Roiling Elements",
                        uuid: "Actor.actor-3.Item.item-6",
                        system: {
                            activities: {
                                get(id)
                                {
                                    return id === "CeVayhK6VQsMSFY8"
                                        ? activity
                                        : null
                                }
                            }
                        },
                        flags: {
                            transformations: {
                                sourceUuid:
                                    "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2"
                            }
                        },
                        updateSource(update)
                        {
                            persistedUpdate = update
                        }
                    }
                    const activity = {
                        _id: "CeVayhK6VQsMSFY8",
                        uuid:
                            "Actor.actor-3.Item.item-6.Activity.CeVayhK6VQsMSFY8",
                        actor,
                        item,
                        save: {
                            dc: {
                                calculation: "",
                                formula: "",
                                value: 0
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: "",
                                    value: 0
                                }
                            }
                        }
                    }
                    const dialogConfig = {}
                    const messageConfig = {}

                    try {
                        const callback = harness.callbacks.get("dnd5e.preActivityUse")
                        expect(callback).to.be.a("function")

                        callback(activity, {}, dialogConfig, messageConfig)

                        await flushAsyncWork()

                        expect(activity.save.dc.formula).to.equal("20")
                        expect(activity.save.dc.value).to.equal(20)
                        expect(activity.labels.save.trim()).to.equal("DC 20")
                        expect(messageConfig.dc.value).to.equal(20)
                        expect(persistedUpdate).to.deep.equal({
                            "system.activities.CeVayhK6VQsMSFY8.save.dc.calculation": "",
                            "system.activities.CeVayhK6VQsMSFY8.save.dc.formula": "20"
                        })
                    } finally {
                        harness.restore()
                    }
                }
            )

            it("skips activityUse trigger dispatch for the Roiling Elements self-save activity", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness({
                    transformationOverrides: {
                        TransformationClass: Primordial
                    }
                })
                const item = {
                    id: "item-4",
                    name: "Roiling Elements",
                    uuid: "Actor.actor-1.Item.item-4",
                    flags: {
                        transformations: {
                            sourceUuid:
                                "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2"
                        }
                    }
                }
                const usage = {
                    workflow: {
                        actor,
                        item
                    }
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.postUseActivity")
                    expect(callback).to.be.a("function")

                    await callback(
                        {
                            id: "CeVayhK6VQsMSFY8",
                            uuid: "Actor.actor-1.Item.item-4.Activity.CeVayhK6VQsMSFY8",
                            name: "",
                            type: "save"
                        },
                        usage,
                        {message: {id: "message-4"}}
                    )

                    expect(
                        harness.calls.triggerRuntime.some(call =>
                            call.name === "activityUse"
                        )
                    ).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it(
                "delegates preUseActivity to the transformation class and applies Blinding Radiance stage DC for actor activities",
                async function ()
                {
                    const actor = {
                        id: "actor-seraph-1",
                        flags: {
                            transformations: {
                                stage: 3
                            }
                        },
                        getFlag(scope, key)
                        {
                            if (scope === "transformations" && key === "stage") {
                                return 3
                            }

                            return null
                        }
                    }
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: Seraph
                        }
                    })
                    let persistedUpdate = null
                    const item = {
                        id: "item-seraph-1",
                        name: "Blinding Radiance",
                        uuid: "Actor.actor-seraph-1.Item.item-seraph-1",
                        system: {
                            activities: {
                                get(id)
                                {
                                    return id === BLINDING_RADIANCE_ACTIVITY_ID
                                        ? activity
                                        : null
                                }
                            }
                        },
                        flags: {
                            transformations: {
                                sourceUuid: BLINDING_RADIANCE_UUID
                            }
                        },
                        updateSource(update)
                        {
                            persistedUpdate = update
                        }
                    }
                    const activity = {
                        id: BLINDING_RADIANCE_ACTIVITY_ID,
                        uuid:
                            `Actor.actor-seraph-1.Item.item-seraph-1.Activity.${BLINDING_RADIANCE_ACTIVITY_ID}`,
                        actor,
                        item,
                        save: {
                            dc: {
                                calculation: "",
                                formula: ""
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: ""
                                }
                            }
                        }
                    }
                    const usageConfig = {}
                    const dialogConfig = {
                        dc: {
                            value: 0
                        }
                    }
                    const messageConfig = {}

                    try {
                        const callback = harness.callbacks.get("dnd5e.preUseActivity")
                        expect(callback).to.be.a("function")

                        callback(activity, usageConfig, dialogConfig, messageConfig)

                        await flushAsyncWork()

                        expect(Array.from(activity.save.ability ?? [])).to.deep.equal(["con"])
                        expect(activity.save.dc.formula).to.equal("16")
                        expect(activity.save.dc.value).to.equal(16)
                        expect(Array.from(activity.system.save.ability ?? [])).to.deep.equal(["con"])
                        expect(activity.system.save.dc.formula).to.equal("16")
                        expect(activity.system.save.dc.value).to.equal(16)
                        expect(activity.labels.save.trim()).to.match(/^DC 16(?:\s+.*)?$/)
                        expect(dialogConfig.dc.value).to.equal(16)
                        expect(messageConfig.dc.value).to.equal(16)
                        expect(
                            messageConfig.data.flags.transformations.blindingRadianceSaveRequest
                        ).to.deep.equal({
                            type: "save",
                            ability: "con",
                            dc: 16
                        })
                        expect(persistedUpdate).to.deep.equal({
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.ability`]: [
                                "con"
                            ],
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.dc.calculation`]: "",
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.dc.formula`]: "16"
                        })
                    } finally {
                        harness.restore()
                    }
                }
            )

            it(
                "delegates preActivityUse to the transformation class and applies Blinding Radiance stage DC",
                async function ()
                {
                    const actor = {
                        id: "actor-seraph-2",
                        flags: {
                            transformations: {
                                stage: 4
                            }
                        },
                        getFlag(scope, key)
                        {
                            if (scope === "transformations" && key === "stage") {
                                return 4
                            }

                            return null
                        }
                    }
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: Seraph
                        }
                    })
                    let persistedUpdate = null
                    const item = {
                        id: "item-seraph-2",
                        name: "Blinding Radiance",
                        uuid: "Actor.actor-seraph-2.Item.item-seraph-2",
                        system: {
                            activities: {
                                get(id)
                                {
                                    return id === BLINDING_RADIANCE_ACTIVITY_ID
                                        ? activity
                                        : null
                                }
                            }
                        },
                        flags: {
                            transformations: {
                                sourceUuid: BLINDING_RADIANCE_UUID
                            }
                        },
                        updateSource(update)
                        {
                            persistedUpdate = update
                        }
                    }
                    const activity = {
                        _id: BLINDING_RADIANCE_ACTIVITY_ID,
                        uuid:
                            `Actor.actor-seraph-2.Item.item-seraph-2.Activity.${BLINDING_RADIANCE_ACTIVITY_ID}`,
                        actor,
                        item,
                        save: {
                            dc: {
                                calculation: "",
                                formula: "",
                                value: 0
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: "",
                                    value: 0
                                }
                            }
                        }
                    }
                    const dialogConfig = {}
                    const messageConfig = {}

                    try {
                        const callback = harness.callbacks.get("dnd5e.preActivityUse")
                        expect(callback).to.be.a("function")

                        callback(activity, {}, dialogConfig, messageConfig)

                        await flushAsyncWork()

                        expect(Array.from(activity.save.ability ?? [])).to.deep.equal(["con"])
                        expect(activity.save.dc.formula).to.equal("20")
                        expect(activity.save.dc.value).to.equal(20)
                        expect(Array.from(activity.system.save.ability ?? [])).to.deep.equal(["con"])
                        expect(activity.labels.save.trim()).to.match(/^DC 20(?:\s+.*)?$/)
                        expect(messageConfig.dc.value).to.equal(20)
                        expect(
                            messageConfig.data.flags.transformations.blindingRadianceSaveRequest
                        ).to.deep.equal({
                            type: "save",
                            ability: "con",
                            dc: 20
                        })
                        expect(persistedUpdate).to.deep.equal({
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.ability`]: [
                                "con"
                            ],
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.dc.calculation`]: "",
                            [`system.activities.${BLINDING_RADIANCE_ACTIVITY_ID}.save.dc.formula`]: "20"
                        })
                    } finally {
                        harness.restore()
                    }
                }
            )

            it("skips activityUse trigger dispatch for the Blinding Radiance self-save activity", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness({
                    transformationOverrides: {
                        TransformationClass: Seraph
                    }
                })
                const item = {
                    id: "item-seraph-3",
                    name: "Blinding Radiance",
                    uuid: "Actor.actor-1.Item.item-seraph-3",
                    flags: {
                        transformations: {
                            sourceUuid: BLINDING_RADIANCE_UUID
                        }
                    }
                }
                const usage = {
                    workflow: {
                        actor,
                        item
                    }
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.postUseActivity")
                    expect(callback).to.be.a("function")

                    await callback(
                        {
                            id: BLINDING_RADIANCE_ACTIVITY_ID,
                            uuid:
                                `Actor.actor-1.Item.item-seraph-3.Activity.${BLINDING_RADIANCE_ACTIVITY_ID}`,
                            name: "",
                            type: "save"
                        },
                        usage,
                        {message: {id: "message-seraph-3"}}
                    )

                    expect(
                        harness.calls.triggerRuntime.some(call =>
                            call.name === "activityUse"
                        )
                    ).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("skips activityUse trigger dispatch for excluded primordial activities", async function ()
            {
                const scenarios = [
                    {
                        name: "sourceUuid on workflow item",
                        itemSourceUuid:
                            "Compendium.transformations.gh-transformations.Item.U1W6fCAmzOKBRmD5",
                        activityId: "xtFaAokFhstQEHWy",
                        buildUsage(actor, item)
                        {
                            return {
                                workflow: {
                                    actor,
                                    item
                                }
                            }
                        },
                        buildActivity(item, activityId)
                        {
                            return {
                                id: activityId,
                                uuid:
                                    `Actor.actor-1.Item.item-excluded.Activity.${activityId}`,
                                name: "",
                                type: "save",
                                parent: {
                                    parent: item
                                }
                            }
                        }
                    },
                    {
                        name: "sourceUuid on workflow activity parent item",
                        itemSourceUuid:
                            "Compendium.transformations.gh-transformations.Item.ZNeHpSQXylLEUtN0",
                        activityId: "bpcaabfmchqSE8HB",
                        buildUsage(actor, item, activity)
                        {
                            return {
                                workflow: {
                                    actor,
                                    activity: {
                                        ...activity,
                                        parent: {
                                            parent: item
                                        }
                                    }
                                }
                            }
                        },
                        buildActivity(_item, activityId)
                        {
                            return {
                                id: activityId,
                                uuid:
                                    `Actor.actor-1.Item.item-excluded.Activity.${activityId}`,
                                name: "",
                                type: "save"
                            }
                        }
                    },
                    {
                        name: "compendium activity uuid without item sourceUuid",
                        itemSourceUuid: null,
                        activityId: "bpcaabfmchqSE8HB",
                        buildUsage(actor)
                        {
                            return {
                                workflow: {
                                    actor
                                }
                            }
                        },
                        buildActivity(_item, activityId)
                        {
                            return {
                                id: activityId,
                                uuid:
                                    `Actor.actor-1.Item.item-excluded.Activity.${activityId}`,
                                name: "",
                                type: "save",
                                _stats: {
                                    compendiumSource:
                                        "Compendium.transformations.gh-transformations.Item.ZNeHpSQXylLEUtN0.Activity.bpcaabfmchqSE8HB"
                                }
                            }
                        }
                    }
                ]

                for (const scenario of scenarios) {
                    const actor = createActor()
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: Primordial
                        }
                    })
                    const item = {
                        id: "item-excluded",
                        name: "Excluded Primordial Activity",
                        uuid: "Actor.actor-1.Item.item-excluded",
                        flags: {
                            transformations: {
                                sourceUuid: scenario.itemSourceUuid
                            }
                        }
                    }
                    const activity = scenario.buildActivity(item, scenario.activityId)
                    const usage = scenario.buildUsage(actor, item, activity)

                    try {
                        const callback = harness.callbacks.get("dnd5e.postUseActivity")
                        expect(callback).to.be.a("function")

                        await callback(activity, usage, {message: {id: "message-excluded"}})

                        expect(
                            harness.calls.triggerRuntime.some(call =>
                                call.name === "activityUse"
                            )
                            , scenario.name).to.equal(false)
                    } finally {
                        harness.restore()
                    }
                }
            })

            it(
                "skips activityUse trigger dispatch when the transformation class returns an explicit skip result",
                async function ()
                {
                    const actor = createActor()
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: {
                                async onActivityUse()
                                {
                                    return {
                                        skipActivityUseTrigger: true
                                    }
                                }
                            }
                        }
                    })
                    const usage = {
                        workflow: {
                            actor,
                            item: {
                                id: "item-plain",
                                name: "Plain Activity Item",
                                uuid: "Actor.actor-1.Item.item-plain"
                            }
                        }
                    }

                    try {
                        const callback = harness.callbacks.get("dnd5e.postUseActivity")
                        expect(callback).to.be.a("function")

                        await callback(
                            {
                                id: "activity-plain",
                                uuid: "Actor.actor-1.Item.item-plain.Activity.activity-plain",
                                name: "Plain Activity",
                                type: "utility"
                            },
                            usage,
                            {message: {id: "message-plain"}}
                        )

                        expect(
                            harness.calls.triggerRuntime.some(call =>
                                call.name === "activityUse"
                            )
                        ).to.equal(false)
                    } finally {
                        harness.restore()
                    }
                }
            )

            it("delegates pre-roll attack handling to the transformation class", async function ()
            {
                const actor = createActor()
                const harness = createHookHarness({
                    transformationOverrides: {
                        TransformationClass: Lycanthrope
                    }
                })
                const originalTargets = game.user.targets
                const rollConfig = {
                    subject: {
                        actor,
                        item: {actor}
                    },
                    disadvantage: true
                }

                game.user.targets = new Set([
                    {
                        actor: {
                            flags: {
                                transformations: {
                                    lycanthrope: {
                                        huntersMark: 1
                                    }
                                }
                            },
                            getFlag(scope, key)
                            {
                                if (
                                    scope === "transformations" &&
                                    key === "lycanthrope.huntersMark"
                                )
                                {
                                    return 1
                                }

                                return null
                            }
                        }
                    }
                ])

                try {
                    const callback = harness.callbacks.get("dnd5e.preRollAttack")
                    expect(callback).to.be.a("function")

                    callback({actor}, rollConfig)

                    await flushAsyncWork()

                    expect(rollConfig.advantage).to.equal(true)
                    expect(rollConfig.disadvantage).to.equal(false)
                } finally {
                    game.user.targets = originalTargets
                    harness.restore()
                }
            })

            it("applies synchronous pre-roll damage modifiers to the pending damage config", async function ()
            {
                const actor = createActor()
                actor.flags = {
                    transformations: {
                        stage: 1
                    }
                }
                actor.items = [
                    {
                        flags: {
                            transformations: {
                                sourceUuid:
                                    "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                            }
                        }
                    }
                ]

                const harness = createHookHarness({
                    transformationOverrides: {
                        TransformationTriggers: {
                            preRollDamage: {
                                actionGroups: [
                                    {
                                        when: {
                                            items: {
                                                has: [
                                                    "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                                                ]
                                            },
                                            custom: {
                                                damage: {
                                                    current: {
                                                        itemDocument: {
                                                            type: ["weapon"]
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        actions: [
                                            {
                                                type: "ROLL_MODIFIER",
                                                data: {
                                                    mode: "addDamageType",
                                                    damageType: "force"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                })

                const item = {
                    type: "weapon",
                    actor
                }
                const activity = {
                    actor,
                    item,
                    damage: {
                        parts: [
                            {
                                types: new Set(["bludgeoning"])
                            }
                        ]
                    }
                }
                const rolls = [
                    {
                        options: {
                            types: ["bludgeoning"]
                        }
                    }
                ]

                try {
                    const callback = harness.callbacks.get("dnd5e.preRollDamageV2")
                    expect(callback).to.be.a("function")

                    callback({
                        subject: activity,
                        rolls
                    }, {}, {})

                    expect(rolls[0].options.types).to.include("force")
                    expect(
                        Array.from(activity.damage.parts[0].types)
                    ).to.include("force")
                } finally {
                    harness.restore()
                }
            })

            it(
                "adds +4 to pre-roll damage for flagged Shadowsteel weapons when the actor has Shadowsteel Weapon Master",
                async function ()
                {
                    const actor = createActor()
                    actor.flags = {
                        transformations: {
                            stage: 2,
                            type: "shadowsteelGhoul"
                        }
                    }
                    actor.items = [
                        {
                            flags: {
                                transformations: {
                                    sourceUuid:
                                        "Compendium.transformations.gh-transformations.Item.cPHwqVOf3unl7c1r"
                                }
                            }
                        }
                    ]

                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationTriggers: {
                                preRollDamage: shadowsteelGhoulOnPreRollDamage
                            }
                        }
                    })
                    const item = {
                        actor,
                        flags: {
                            transformations: {
                                shadowsteelGhoul: {
                                    shadowsteelWeapon: 1
                                }
                            }
                        }
                    }
                    const activity = {
                        actor,
                        item
                    }
                    const rolls = [
                        {
                            formula: "1d8 + 3",
                            _formula: "1d8 + 3"
                        }
                    ]

                    try {
                        const callback = harness.callbacks.get("dnd5e.preRollDamageV2")
                        expect(callback).to.be.a("function")

                        callback({
                            subject: activity,
                            rolls
                        }, {}, {})

                        expect(rolls[0].formula).to.equal("1d8 + 3 + 4")
                        expect(rolls[0]._formula).to.equal("1d8 + 3 + 4")
                    } finally {
                        harness.restore()
                    }
                }
            )

            it(
                "does not add Shadowsteel Weapon Master damage when the weapon flag or feat is missing",
                async function ()
                {
                    const scenarios = [
                        {
                            name: "missing feat item",
                            actorItems: [],
                            itemFlags: {
                                transformations: {
                                    shadowsteelGhoul: {
                                        shadowsteelWeapon: 1
                                    }
                                }
                            }
                        },
                        {
                            name: "missing weapon flag",
                            actorItems: [
                                {
                                    flags: {
                                        transformations: {
                                            sourceUuid:
                                                "Compendium.transformations.gh-transformations.Item.cPHwqVOf3unl7c1r"
                                        }
                                    }
                                }
                            ],
                            itemFlags: {}
                        }
                    ]

                    for (const scenario of scenarios) {
                        const actor = createActor()
                        actor.flags = {
                            transformations: {
                                stage: 2,
                                type: "shadowsteelGhoul"
                            }
                        }
                        actor.items = scenario.actorItems

                        const harness = createHookHarness({
                            transformationOverrides: {
                                TransformationTriggers: {
                                    preRollDamage: shadowsteelGhoulOnPreRollDamage
                                }
                            }
                        })
                        const item = {
                            actor,
                            flags: scenario.itemFlags
                        }
                        const activity = {
                            actor,
                            item
                        }
                        const rolls = [
                            {
                                parts: ["1d8 + 3"]
                            }
                        ]

                        try {
                            const callback = harness.callbacks.get("dnd5e.preRollDamageV2")
                            expect(callback, scenario.name).to.be.a("function")

                            callback({
                                subject: activity,
                                rolls
                            }, {}, {})

                            expect(rolls[0].parts[0], scenario.name).to.equal("1d8 + 3")
                        } finally {
                            harness.restore()
                        }
                    }
                }
            )

            it("stores the midi damage type on the resolved actor during pre-calculate damage", async function ()
            {
                let persistedUpdate = null
                const actor = {
                    id: "actor-1",
                    flags: {
                        transformations: {
                            damageTypePerMidiId: {
                                existing: "cold"
                            }
                        }
                    },
                    getFlag(scope, key)
                    {
                        return this.flags?.[scope]?.[key] ?? null
                    },
                    async setFlag(scope, key, value)
                    {
                        persistedUpdate = {
                            scope,
                            key,
                            value
                        }
                        this.flags[scope][key] = value
                        return undefined
                    }
                }
                const harness = createHookHarness()
                const damageDetails = [
                    {
                        type: "fire",
                        value: 12
                    }
                ]
                const details = {
                    midi: {
                        sourceActorUuid: "midi-source-1"
                    }
                }

                try {
                    const callback = harness.callbacks.get("dnd5e.preCalculateDamage")
                    expect(callback).to.be.a("function")

                    callback({actor}, damageDetails, details)

                    await flushAsyncWork()

                    expect(persistedUpdate).to.deep.equal({
                        scope: "transformations",
                        key: "damageTypePerMidiId",
                        value: {
                            existing: "cold",
                            "midi-source-1": "fire"
                        }
                    })
                } finally {
                    harness.restore()
                }
            })

            it(
                "delegates apply-damage handling to the transformation class and clears the midi damage type entry",
                async function ()
                {
                    let receivedArgs = null
                    const persistedUpdates = []
                    const actor = {
                        id: "actor-1",
                        flags: {
                            transformations: {
                                damageTypePerMidiId: {
                                    "midi-source-1": "fire",
                                    existing: "cold"
                                }
                            }
                        },
                        getFlag(scope, key)
                        {
                            return this.flags?.[scope]?.[key] ?? null
                        },
                        async setFlag(scope, key, value)
                        {
                            persistedUpdates.push({
                                scope,
                                key,
                                value
                            })
                            this.flags[scope][key] = value
                            return this
                        }
                    }
                    const harness = createHookHarness({
                        transformationOverrides: {
                            TransformationClass: {
                                onPreRollHitDie() {},
                                async onPreRollSavingThrow() {},
                                async onRoll() {},
                                async onPreCalculateDamage(args)
                                {
                                    receivedArgs = args
                                }
                            }
                        }
                    })
                    const target = {actor}
                    const damage = {
                        amount: 12
                    }
                    const details = {
                        midi: {
                            sourceActorUuid: "midi-source-1"
                        },
                        source: "test"
                    }

                    try {
                        const callback = harness.callbacks.get("dnd5e.applyDamage")
                        expect(callback).to.be.a("function")

                        callback(target, damage, details)

                        await flushAsyncWork()

                        expect(receivedArgs).to.exist
                        expect(receivedArgs.actor).to.equal(actor)
                        expect(receivedArgs.target).to.equal(target)
                        expect(receivedArgs.damage).to.equal(damage)
                        expect(receivedArgs.details).to.equal(details)
                        expect(persistedUpdates.at(-1)).to.deep.equal({
                            scope: "transformations",
                            key: "damageTypePerMidiId",
                            value: {
                                existing: "cold"
                            }
                        })
                    } finally {
                        harness.restore()
                    }
                }
            )
        })
    }
)
