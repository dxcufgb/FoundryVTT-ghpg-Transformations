import { Lich } from "../../domain/transformation/subclasses/lich/Lich.js"
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

function createHarness()
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
        game: {},
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
                return {constructor: Lich}
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
    }
)
