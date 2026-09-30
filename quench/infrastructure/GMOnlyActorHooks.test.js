import { Lich } from "../../domain/transformation/subclasses/lich/Lich.js"
import {
    Seraph,
    SERAPH_CORRUPTION_EFFECT_UUID
} from "../../domain/transformation/subclasses/seraph/Seraph.js"
import {
    registerActorPreUpdateHooks,
    registerGMOnlyActorHooks
} from "../../infrastructure/hooks/GMOnlyActorHooks.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        error() {}
    }
}

function setProperty(target, path, value)
{
    const parts = path.split(".")
    const lastPart = parts.pop()

    let current = target
    for (const part of parts) {
        current[part] ??= {}
        current = current[part]
    }

    current[lastPart] = value
}

function getProperty(target, path)
{
    return path.split(".").reduce((value, part) => value?.[part], target)
}

function createSoulVessel(actor, {
    value = 1,
    spent = 0,
    max = 1
} = {})
{
    return {
        name: "Soul Vessel",
        parent: actor,
        system: {
            uses: {
                value,
                spent,
                max
            }
        }
    }
}

function createActor()
{
    return {
        id: "actor-1",
        flags: {
            transformations: {
                lich: {}
            }
        },
        system: {
            attributes: {
                hp: {
                    value: 10,
                    max: 10
                }
            }
        },
        getFlag(scope, key)
        {
            return this.flags?.[scope]?.[key] ?? null
        },
        async update(data)
        {
            for (const [path, value] of Object.entries(data)) {
                setProperty(this, path, value)
            }

            return this
        }
    }
}

// Actor with a Fey Dreams and Nightmares style effect that repeats its save on damage.
function createRepeatSaveActor({hp = 10, temp = 0} = {})
{
    const actor = createActor()
    actor.system.attributes.hp.value = hp
    actor.system.attributes.hp.temp = temp
    const rolls = []
    const effect = {
        id: "dream",
        disabled: false,
        changes: [{
            key: "flags.midi-qol.OverTime",
            value: "turn=end, saveAbility=con, saveDC=13, label=Dreams and Nightmares"
        }],
        getFlag(scope, key)
        {
            return scope === "transformations" && key === "repeatSaveOnDamage"
                ? {ability: "con", disadvantage: false}
                : null
        },
        async delete() {}
    }
    const effects = [effect]
    actor.effects = Object.assign(effects, {get: id => effects.find(e => e.id === id)})
    actor.rollSavingThrow = async config =>
    {
        rolls.push(config)
        return [{total: 5, isSuccess: false}]
    }

    return {actor, rolls}
}

// Runs an HP update through the preUpdateActor/updateActor hooks, optionally as damage applied
// through Actor5e#applyDamage (which fires dnd5e.preApplyDamage first).
async function runHpUpdate(harness, actor, {value, temp, damage = null, options = {}})
{
    const updates = {}
    if (value !== undefined) updates["system.attributes.hp.value"] = value
    if (temp !== undefined) updates["system.attributes.hp.temp"] = temp

    if (damage != null) {
        await harness.callbacks.get("dnd5e.preApplyDamage")(actor, damage, updates, {})
    }

    const changed = {}
    for (const [path, next] of Object.entries(updates)) setProperty(changed, path, next)

    await harness.callbacks.get("preUpdateActor")(actor, changed, options, "user-1")
    for (const [path, next] of Object.entries(updates)) setProperty(actor, path, next)
    await harness.callbacks.get("updateActor")(actor, changed, options, "user-1")

    if (damage != null) {
        await harness.callbacks.get("dnd5e.applyDamage")(actor, damage, {})
    }
}

function createGame({activeGm = true} = {})
{
    const user = {id: "gm-this-client"}
    return {
        user,
        users: {
            // Which GM Foundry designates as the active one; another connected GM outranks this client.
            activeGM: activeGm ? user : {id: "gm-other-client"}
        }
    }
}

function createHarness({
    TransformationClass = Lich,
    game = createGame(),
    registerGmHooks = true
} = {})
{
    const originalHooks = globalThis.Hooks
    const originalFoundry = globalThis.foundry
    const callbacks = new Map()
    const calls = {
        triggerRuntime: []
    }

    globalThis.Hooks = {
        on(name, callback)
        {
            callbacks.set(name, callback)
        }
    }

    globalThis.foundry = {
        ...(originalFoundry ?? {}),
        utils: {
            ...(originalFoundry?.utils ?? {}),
            getProperty
        }
    }

    const actorRepository = {
        resolveActor(parent)
        {
            return parent ?? null
        }
    }
    const transformationQueryService = {
        async getForActor()
        {
            return {constructor: TransformationClass}
        }
    }

    const transformationRegistry = {
        getEntryForActor()
        {
            return {TransformationClass}
        }
    }

    // Every client (players included) registers the preUpdate* hooks.
    registerActorPreUpdateHooks({
        actorRepository,
        transformationQueryService,
        transformationRegistry,
        logger: createLogger()
    })

    if (registerGmHooks) registerGMOnlyActorHooks({
        game,
        ActorClass: {},
        moduleUi: {},
        actorRepository,
        triggerRuntime: {
            async run(name, actor, data)
            {
                calls.triggerRuntime.push({name, actor, data})
            }
        },
        transformationQueryService,
        constants: {
            CONDITION: {
                BLOODIED: "bloodied",
                CHARMED: "charmed",
                FRIGHTENED: "frightened",
                UNCONSCIOUS: "unconscious"
            }
        },
        registerActorSheetControlsAdapter() {},
        debouncedTracker: {
            pulse() {}
        },
        logger: createLogger()
    })

    return {
        calls,
        callbacks,
        restore()
        {
            globalThis.Hooks = originalHooks
            globalThis.foundry = originalFoundry
        }
    }
}

quench.registerBatch(
    "transformations.infrastructure.GMOnlyActorHooks",
    ({describe, it, expect}) =>
    {
        describe("registerGMOnlyActorHooks", function()
        {
            it("sets soulVesselCharged to false when Soul Vessel uses reach 0", async function()
            {
                const actor = createActor()
                actor.flags.transformations.lich.soulVesselCharged = true

                const harness = createHarness()
                const item = createSoulVessel(actor, {
                    value: 1,
                    spent: 0
                })
                const options = {}

                try {
                    const preUpdateCallback = harness.callbacks.get("preUpdateItem")
                    const updateCallback = harness.callbacks.get("updateItem")
                    expect(preUpdateCallback).to.be.a("function")
                    expect(updateCallback).to.be.a("function")

                    const changed = {
                        system: {
                            uses: {
                                value: 0,
                                spent: 1
                            }
                        }
                    }

                    await preUpdateCallback(
                        item,
                        changed,
                        options,
                        "user-1"
                    )

                    item.system.uses.value = 0
                    item.system.uses.spent = 1

                    await updateCallback(
                        item,
                        changed,
                        options,
                        "user-1"
                    )

                    expect(actor.flags.transformations.lich.soulVesselCharged).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("sets soulVesselCharged to true when Soul Vessel uses stay above 0", async function()
            {
                const actor = createActor()
                actor.flags.transformations.lich.soulVesselCharged = false

                const harness = createHarness()
                const item = createSoulVessel(actor, {
                    value: 0,
                    spent: 1
                })
                const options = {}

                try {
                    const preUpdateCallback = harness.callbacks.get("preUpdateItem")
                    const updateCallback = harness.callbacks.get("updateItem")
                    expect(preUpdateCallback).to.be.a("function")
                    expect(updateCallback).to.be.a("function")

                    const changed = {
                        system: {
                            uses: {
                                value: 1,
                                spent: 0
                            }
                        }
                    }

                    await preUpdateCallback(
                        item,
                        changed,
                        options,
                        "user-1"
                    )

                    item.system.uses.value = 1
                    item.system.uses.spent = 0

                    await updateCallback(
                        item,
                        changed,
                        options,
                        "user-1"
                    )

                    expect(actor.flags.transformations.lich.soulVesselCharged).to.equal(true)
                } finally {
                    harness.restore()
                }
            })

            it("writes preUpdateItem state into the update options synchronously", function()
            {
                const actor = createActor()
                const harness = createHarness()
                const item = createSoulVessel(actor, {
                    value: 1,
                    spent: 0
                })
                const options = {}

                try {
                    const result = harness.callbacks.get("preUpdateItem")(
                        item,
                        {system: {uses: {value: 0, spent: 1}}},
                        options,
                        "user-1"
                    )

                    // Foundry does not await preUpdate* hooks, so nothing may be deferred.
                    expect(result instanceof Promise).to.equal(false)
                    expect(options.transformations?.lich?.soulVesselCharged).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("does not listen to applyActiveEffect, which fires on every data preparation", async function()
            {
                const harness = createHarness()

                try {
                    expect(harness.callbacks.has("applyActiveEffect")).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("dispatches conditionApplied when charmed is created", async function()
            {
                const actor = createActor()
                const harness = createHarness()

                try {
                    await harness.callbacks.get("createActiveEffect")(
                        {parent: actor, name: "Charmed"},
                        {},
                        "user-1"
                    )

                    expect(harness.calls.triggerRuntime.map(call => call.name)).to.deep.equal(["conditionApplied"])
                } finally {
                    harness.restore()
                }
            })

            it("dispatches conditionApplied when a charmed effect is re-enabled", async function()
            {
                const actor = createActor()
                const harness = createHarness()

                try {
                    const callback = harness.callbacks.get("updateActiveEffect")
                    expect(callback).to.be.a("function")

                    await callback({parent: actor, name: "Charmed"}, {name: "Charmed"}, {}, "user-1")
                    expect(harness.calls.triggerRuntime).to.have.length(0)

                    await callback({parent: actor, name: "Charmed"}, {disabled: false}, {}, "user-1")

                    expect(harness.calls.triggerRuntime).to.deep.include({
                        name: "conditionApplied",
                        actor,
                        data: {
                            conditions: {
                                current: {
                                    name: "charmed"
                                }
                            }
                        }
                    })
                } finally {
                    harness.restore()
                }
            })

            it("dispatches bloodied when the bloodied effect is created", async function()
            {
                const actor = createActor()
                const harness = createHarness()
                const effect = {
                    parent: actor,
                    name: "Bloodied"
                }

                try {
                    const callback = harness.callbacks.get("createActiveEffect")
                    expect(callback).to.be.a("function")

                    await callback(effect, {}, "user-1")

                    expect(harness.calls.triggerRuntime).to.deep.include({
                        name: "bloodied",
                        actor,
                        data: undefined
                    })
                } finally {
                    harness.restore()
                }
            })

            it("posts Seraph Corruption description when the effect is created", async function()
            {
                const actor = createActor()
                const harness = createHarness({
                    TransformationClass: Seraph
                })
                const originalChatMessage = globalThis.ChatMessage
                const createdMessages = []
                const effect = {
                    parent: actor,
                    name: "Seraph Corruption",
                    description: "<p>The celestial light turns inward.</p>",
                    flags: {
                        transformations: {
                            grantedBy: {
                                sourceUuid: SERAPH_CORRUPTION_EFFECT_UUID
                            }
                        }
                    },
                    getFlag(scope, key)
                    {
                        return this.flags?.[scope]?.[key] ?? null
                    }
                }

                globalThis.ChatMessage = {
                    getSpeaker({actor})
                    {
                        return {
                            actor: actor.id
                        }
                    },
                    async create(data)
                    {
                        createdMessages.push(data)
                        return data
                    }
                }

                try {
                    const callback = harness.callbacks.get("createActiveEffect")
                    expect(callback).to.be.a("function")

                    await callback(effect, {}, "user-1")

                    expect(createdMessages).to.have.length(1)
                    expect(createdMessages[0].speaker.actor).to.equal(actor.id)
                    expect(createdMessages[0].content).to.contain(
                        "Seraph Corruption has been applied."
                    )
                    expect(createdMessages[0].content).to.contain(
                        "The celestial light turns inward."
                    )
                } finally {
                    globalThis.ChatMessage = originalChatMessage
                    harness.restore()
                }
            })

            it("dispatches zeroHp when actor hp transitions from above 0 to 0", async function()
            {
                const actor = createActor()
                const harness = createHarness()

                try {
                    const preUpdateCallback = harness.callbacks.get("preUpdateActor")
                    const updateCallback = harness.callbacks.get("updateActor")
                    expect(preUpdateCallback).to.be.a("function")
                    expect(updateCallback).to.be.a("function")

                    const changed = {
                        system: {
                            attributes: {
                                hp: {
                                    value: 0
                                }
                            }
                        }
                    }

                    const options = {}
                    await preUpdateCallback(actor, changed, options, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, changed, options, "user-1")

                    expect(harness.calls.triggerRuntime).to.deep.include({
                        name: "zeroHp",
                        actor,
                        data: undefined
                    })
                } finally {
                    harness.restore()
                }
            })

            it("does not dispatch zeroHp again while actor remains at 0 hp", async function()
            {
                const actor = createActor()
                const harness = createHarness()

                try {
                    const preUpdateCallback = harness.callbacks.get("preUpdateActor")
                    const updateCallback = harness.callbacks.get("updateActor")
                    expect(preUpdateCallback).to.be.a("function")
                    expect(updateCallback).to.be.a("function")

                    const firstChange = {
                        system: {
                            attributes: {
                                hp: {
                                    value: 0
                                }
                            }
                        }
                    }

                    const firstOptions = {}
                    await preUpdateCallback(actor, firstChange, firstOptions, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, firstChange, firstOptions, "user-1")

                    const secondChange = {
                        system: {
                            attributes: {
                                hp: {
                                    value: 0
                                }
                            }
                        }
                    }

                    const secondOptions = {}
                    await preUpdateCallback(actor, secondChange, secondOptions, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, secondChange, secondOptions, "user-1")

                    expect(
                        harness.calls.triggerRuntime.filter(call =>
                            call.name === "zeroHp"
                        )
                    ).to.have.length(1)
                } finally {
                    harness.restore()
                }
            })
        })

        describe("only the active GM handles document hooks", function()
        {
            const inactiveGame = () => createGame({activeGm: false})

            it("does not dispatch bloodied for a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                const harness = createHarness({game: inactiveGame()})

                try {
                    await harness.callbacks.get("createActiveEffect")(
                        {parent: actor, name: "Bloodied"},
                        {},
                        "user-1"
                    )

                    expect(harness.calls.triggerRuntime).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("runs a bloodied trigger exactly once when two GM clients receive the same hook", async function()
            {
                const actor = createActor()
                const effect = {parent: actor, name: "Bloodied"}
                const activeClient = createHarness({game: createGame({activeGm: true})})
                const otherClient = createHarness({game: inactiveGame()})

                try {
                    await activeClient.callbacks.get("createActiveEffect")(effect, {}, "user-1")
                    await otherClient.callbacks.get("createActiveEffect")(effect, {}, "user-1")

                    const total = activeClient.calls.triggerRuntime.length + otherClient.calls.triggerRuntime.length
                    expect(total).to.equal(1)
                } finally {
                    otherClient.restore()
                    activeClient.restore()
                }
            })

            it("does not post the Seraph Corruption message from a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                const harness = createHarness({TransformationClass: Seraph, game: inactiveGame()})
                const originalChatMessage = globalThis.ChatMessage
                const createdMessages = []
                globalThis.ChatMessage = {
                    getSpeaker: ({actor}) => ({actor: actor.id}),
                    async create(data)
                    {
                        createdMessages.push(data)
                        return data
                    }
                }

                try {
                    await harness.callbacks.get("createActiveEffect")({
                        parent: actor,
                        name: "Seraph Corruption",
                        description: "<p>Light.</p>",
                        flags: {transformations: {grantedBy: {sourceUuid: SERAPH_CORRUPTION_EFFECT_UUID}}},
                        getFlag(scope, key)
                        {
                            return this.flags?.[scope]?.[key] ?? null
                        }
                    }, {}, "user-1")

                    expect(createdMessages).to.have.length(0)
                } finally {
                    globalThis.ChatMessage = originalChatMessage
                    harness.restore()
                }
            })

            it("does not dispatch conditionApplied for a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                const harness = createHarness({game: inactiveGame()})

                try {
                    await harness.callbacks.get("updateActiveEffect")(
                        {parent: actor, name: "Charmed"},
                        {disabled: false},
                        {},
                        "user-1"
                    )

                    expect(harness.calls.triggerRuntime).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("does not clean up Fiend gift items from a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                actor.flags.transformations.fiend = {gift1: {effectId: "effect-1", itemIds: ["item-1"]}}
                actor.items = {get: id => ({id})}
                let deleted = 0
                actor.deleteEmbeddedDocuments = async () => { deleted++ }
                const harness = createHarness({game: inactiveGame()})

                try {
                    await harness.callbacks.get("deleteActiveEffect")(
                        {parent: actor, id: "effect-1", getFlag: () => null},
                        {},
                        "user-1"
                    )

                    expect(deleted).to.equal(0)
                    expect(actor.flags.transformations.fiend).to.have.property("gift1")
                } finally {
                    harness.restore()
                }
            })

            it("does not update the Soul Vessel flag from a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                actor.flags.transformations.lich.soulVesselCharged = true
                const harness = createHarness({game: inactiveGame()})
                const item = createSoulVessel(actor, {value: 0, spent: 1})

                try {
                    await harness.callbacks.get("updateItem")(
                        item,
                        {system: {uses: {value: 0, spent: 1}}},
                        {},
                        "user-1"
                    )

                    expect(actor.flags.transformations.lich.soulVesselCharged).to.equal(true)
                } finally {
                    harness.restore()
                }
            })

            it("does not dispatch zeroHp from a GM client that is not the active GM", async function()
            {
                const actor = createActor()
                const harness = createHarness({game: inactiveGame()})
                const changed = {system: {attributes: {hp: {value: 0}}}}
                const options = {}

                try {
                    await harness.callbacks.get("preUpdateActor")(actor, changed, options, "user-1")
                    actor.system.attributes.hp.value = 0
                    await harness.callbacks.get("updateActor")(actor, changed, options, "user-1")

                    expect(harness.calls.triggerRuntime).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("dispatches zeroHp on the active GM when a player client made the HP change", async function()
            {
                // The player client runs preUpdateActor; the previous HP reaches the GM in the update options.
                const actor = createActor()
                const changed = {system: {attributes: {hp: {value: 0}}}}
                const options = {}
                const playerClient = createHarness({registerGmHooks: false})

                try {
                    expect(playerClient.callbacks.has("updateActor")).to.equal(false)
                    await playerClient.callbacks.get("preUpdateActor")(actor, changed, options, "player-1")
                } finally {
                    playerClient.restore()
                }

                const gmClient = createHarness()
                try {
                    actor.system.attributes.hp.value = 0
                    await gmClient.callbacks.get("updateActor")(actor, changed, options, "player-1")

                    expect(gmClient.calls.triggerRuntime.map(call => call.name)).to.deep.equal(["zeroHp"])
                } finally {
                    gmClient.restore()
                }
            })

            it("repeats the save of a repeatSaveOnDamage effect when the actor loses HP", async function()
            {
                const actor = createActor()
                const rolls = []
                const deleted = []
                const createEffect = (id, disadvantage) => ({
                    id,
                    disabled: false,
                    changes: [{
                        key: "flags.midi-qol.OverTime",
                        value: "turn=end, saveAbility=con, saveDC=8 + 3 + 2, label=Dreams and Nightmares"
                    }],
                    getFlag(scope, key)
                    {
                        return scope === "transformations" && key === "repeatSaveOnDamage"
                            ? {ability: "con", disadvantage}
                            : null
                    },
                    async delete()
                    {
                        deleted.push(id)
                    }
                })
                const effects = [createEffect("dream", false), createEffect("dream-conc", true)]
                actor.effects = Object.assign(effects, {get: id => effects.find(e => e.id === id)})
                actor.rollSavingThrow = async config =>
                {
                    rolls.push(config)
                    // First save succeeds, second fails
                    return [{total: rolls.length === 1 ? 13 : 12, isSuccess: rolls.length === 1}]
                }
                const harness = createHarness()
                const changed = {system: {attributes: {hp: {value: 6}}}}
                const options = {}

                try {
                    await harness.callbacks.get("preUpdateActor")(actor, changed, options, "user-1")
                    actor.system.attributes.hp.value = 6
                    await harness.callbacks.get("updateActor")(actor, changed, options, "user-1")

                    expect(rolls).to.deep.equal([
                        {ability: "con", target: 13, disadvantage: false},
                        {ability: "con", target: 13, disadvantage: true}
                    ])
                    expect(deleted).to.deep.equal(["dream"])
                } finally {
                    harness.restore()
                }
            })

            it("repeats the save when damage is fully absorbed by temporary HP", async function()
            {
                const {actor, rolls} = createRepeatSaveActor({hp: 10, temp: 8})
                const harness = createHarness()

                try {
                    await runHpUpdate(harness, actor, {value: 10, temp: 3, damage: 5})

                    expect(rolls).to.deep.equal([{ability: "con", target: 13, disadvantage: false}])
                } finally {
                    harness.restore()
                }
            })

            it("marks the damage on a player client so the GM repeats the save", async function()
            {
                const {actor, rolls} = createRepeatSaveActor({hp: 10, temp: 8})
                const options = {}
                const playerClient = createHarness({registerGmHooks: false})
                const changed = {system: {attributes: {hp: {value: 10, temp: 3}}}}

                try {
                    const updates = {"system.attributes.hp.value": 10, "system.attributes.hp.temp": 3}
                    await playerClient.callbacks.get("dnd5e.preApplyDamage")(actor, 5, updates, {})
                    await playerClient.callbacks.get("preUpdateActor")(actor, changed, options, "player-1")
                } finally {
                    playerClient.restore()
                }

                const gmClient = createHarness()
                try {
                    actor.system.attributes.hp.temp = 3
                    await gmClient.callbacks.get("updateActor")(actor, changed, options, "player-1")

                    expect(rolls).to.have.length(1)
                } finally {
                    gmClient.restore()
                }
            })

            it("does not repeat the save when temporary HP is removed without damage", async function()
            {
                // e.g. an effect clearing temporary HP, or a GM editing it on the sheet
                const {actor, rolls} = createRepeatSaveActor({hp: 10, temp: 8})
                const harness = createHarness()

                try {
                    await runHpUpdate(harness, actor, {temp: 0})
                    await runHpUpdate(harness, actor, {value: 10, temp: 0})

                    expect(rolls).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("does not repeat the save on healing, temporary HP gains or rests", async function()
            {
                const {actor, rolls} = createRepeatSaveActor({hp: 6, temp: 4})
                const harness = createHarness()

                try {
                    // Healing through applyDamage (negative amount)
                    await runHpUpdate(harness, actor, {value: 9, temp: 4, damage: -3})
                    // Temporary HP replaced by a larger amount
                    await runHpUpdate(harness, actor, {temp: 10})
                    // A rest that clears temporary HP
                    await runHpUpdate(harness, actor, {value: 10, temp: 0, options: {isRest: true}})

                    expect(rolls).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("ignores a cancelled damage application when the next update is not the damage", async function()
            {
                const {actor, rolls} = createRepeatSaveActor({hp: 10, temp: 8})
                const harness = createHarness()

                try {
                    // Another preApplyDamage hook cancelled this damage, so no update or applyDamage follows.
                    await harness.callbacks.get("dnd5e.preApplyDamage")(actor, 5, {
                        "system.attributes.hp.value": 10,
                        "system.attributes.hp.temp": 3
                    }, {})
                    // A later, unrelated update that sets different HP and clears temporary HP.
                    await runHpUpdate(harness, actor, {value: 12, temp: 0})

                    expect(rolls).to.have.length(0)
                } finally {
                    harness.restore()
                }
            })

            it("dispatches deleteActiveEffect to the transformation class", async function()
            {
                const actor = createActor()
                const received = []
                const harness = createHarness({
                    TransformationClass: {
                        async deleteActiveEffect(args)
                        {
                            received.push(args)
                        }
                    }
                })
                const effect = {parent: actor, id: "effect-9", getFlag: () => null}

                try {
                    await harness.callbacks.get("deleteActiveEffect")(effect, {}, "user-1")

                    expect(received).to.have.length(1)
                    expect(received[0].effect).to.equal(effect)
                    expect(received[0].actor).to.equal(actor)
                } finally {
                    harness.restore()
                }
            })
        })
    }
)
