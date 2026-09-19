import { Lich } from "../../domain/transformation/subclasses/lich/Lich.js"
import {
    Seraph,
    SERAPH_CORRUPTION_EFFECT_UUID
} from "../../domain/transformation/subclasses/seraph/Seraph.js"
import { registerGMOnlyActorHooks } from "../../infrastructure/hooks/GMOnlyActorHooks.js"

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
    game = createGame()
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

    registerGMOnlyActorHooks({
        game,
        ActorClass: {},
        moduleUi: {},
        actorRepository: {
            resolveActor(parent)
            {
                return parent ?? null
            }
        },
        triggerRuntime: {
            async run(name, actor, data)
            {
                calls.triggerRuntime.push({name, actor, data})
            }
        },
        transformationQueryService: {
            async getForActor()
            {
                return {constructor: TransformationClass}
            }
        },
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

            it("dispatches conditionApplied when charmed is applied", async function()
            {
                const actor = createActor()
                const harness = createHarness()
                const target = actor
                const context = {
                    effect: {
                        name: "Charmed"
                    }
                }

                try {
                    const callback = harness.callbacks.get("applyActiveEffect")
                    expect(callback).to.be.a("function")

                    await callback(target, context)

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

                    await preUpdateCallback(actor, changed, {}, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, changed, {}, "user-1")

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

                    await preUpdateCallback(actor, firstChange, {}, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, firstChange, {}, "user-1")

                    const secondChange = {
                        system: {
                            attributes: {
                                hp: {
                                    value: 0
                                }
                            }
                        }
                    }

                    await preUpdateCallback(actor, secondChange, {}, "user-1")
                    actor.system.attributes.hp.value = 0
                    await updateCallback(actor, secondChange, {}, "user-1")

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
                    await harness.callbacks.get("applyActiveEffect")(actor, {effect: {name: "Charmed"}})

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

            it("still dispatches zeroHp on the GM client that made the change, even when it is not the active GM", async function()
            {
                // updateActor uses the HP captured by this client's own preUpdateActor, so it must not be guarded.
                const actor = createActor()
                const harness = createHarness({game: inactiveGame()})
                const changed = {system: {attributes: {hp: {value: 0}}}}

                try {
                    await harness.callbacks.get("preUpdateActor")(actor, changed, {}, "user-1")
                    actor.system.attributes.hp.value = 0
                    await harness.callbacks.get("updateActor")(actor, changed, {}, "user-1")

                    expect(harness.calls.triggerRuntime.map(call => call.name)).to.deep.equal(["zeroHp"])
                } finally {
                    harness.restore()
                }
            })
        })
    }
)
