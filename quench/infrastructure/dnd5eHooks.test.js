import { registerDnd5eHooks } from "../../infrastructure/hooks/dnd5eHooks.js"
import { Lycanthrope } from "../../domain/transformation/subclasses/lycanthrope/Lycanthrope.js"
import { Primordial } from "../../domain/transformation/subclasses/primordial/Primordial.js"

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
        })
    }
)
