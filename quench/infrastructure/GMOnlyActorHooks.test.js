import { Lich } from "../../domain/transformation/subclasses/lich/Lich.js"
import { registerGMOnlyActorHooks } from "../../infrastructure/hooks/GMOnlyActorHooks.js"

function createLogger()
{
    return {
        debug() {},
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
        flags: {
            transformations: {
                lich: {}
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
        triggerRuntime: {},
        transformationQueryService: {
            async getForActor()
            {
                return {constructor: Lich}
            }
        },
        constants: {
            CONDITION: {
                BLOODIED: "bloodied",
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
        })
    }
)
