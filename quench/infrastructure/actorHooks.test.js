import {
    Primordial,
    PRIMORDIAL_EARTH_FEATURE_UUID
} from "../../domain/transformation/subclasses/primordial/Primordial.js"
import { registerActorHooks } from "../../infrastructure/hooks/actorHooks.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        error() {}
    }
}

function createHarness({
    TransformationClass = Primordial
} = {})
{
    const originalHooks = globalThis.Hooks
    const callbacks = new Map()

    globalThis.Hooks = {
        on(name, callback)
        {
            const hooks = callbacks.get(name) ?? []
            hooks.push(callback)
            callbacks.set(name, hooks)
        }
    }

    registerActorHooks({
        transformationTypes: {},
        transformationService: {
            onActorFlagsUpdated() {}
        },
        transformationQueryService: {
            async getForActor()
            {
                return null
            },
            async getAll()
            {
                return []
            }
        },
        transformationRegistry: {
            getEntryForActor()
            {
                return { TransformationClass }
            }
        },
        game: {
            user: {
                id: "user-1"
            }
        },
        moduleUi: {},
        renderTemplate: async () => "",
        debouncedTracker: {
            pulse() {}
        },
        logger: createLogger()
    })

    return {
        callback(name)
        {
            return callbacks.get(name)?.at(-1) ?? null
        },
        restore()
        {
            globalThis.Hooks = originalHooks
        }
    }
}

function createActor({
    tempHp = 0,
    proficiencyBonus = 3,
    items = [],
    effects = []
} = {})
{
    return {
        id: "actor-1",
        flags: {
            transformations: {
                type: "primordial"
            }
        },
        items,
        effects,
        system: {
            attributes: {
                prof: proficiencyBonus,
                hp: {
                    temp: tempHp
                }
            }
        }
    }
}

function createEarthFeatureItem()
{
    return {
        flags: {
            transformations: {
                sourceUuid: PRIMORDIAL_EARTH_FEATURE_UUID
            }
        }
    }
}

quench.registerBatch(
    "transformations.infrastructure.actorHooks",
    ({ describe, it, expect }) =>
    {
        describe("registerActorHooks", function()
        {
            it("adds proficiency bonus to temporary HP gains for Primordial Earth", function()
            {
                const actor = createActor({
                    items: [createEarthFeatureItem()],
                    proficiencyBonus: 3
                })
                const changed = {
                    system: {
                        attributes: {
                            hp: {
                                temp: 5
                            }
                        }
                    }
                }
                const harness = createHarness()

                try {
                    const callback = harness.callback("preUpdateActor")
                    expect(callback).to.be.a("function")

                    callback(actor, changed, {}, "user-1")

                    expect(changed.system.attributes.hp.temp).to.equal(8)
                } finally {
                    harness.restore()
                }
            })

            it("supports flattened temporary HP update paths", function()
            {
                const actor = createActor({
                    items: [createEarthFeatureItem()],
                    proficiencyBonus: 4
                })
                const changed = {
                    "system.attributes.hp.temp": 6
                }
                const harness = createHarness()

                try {
                    const callback = harness.callback("preUpdateActor")
                    expect(callback).to.be.a("function")

                    callback(actor, changed, {}, "user-1")

                    expect(changed["system.attributes.hp.temp"]).to.equal(10)
                } finally {
                    harness.restore()
                }
            })

            it("boosts explicit temporary HP gains before comparing to current temporary HP", function()
            {
                const actor = createActor({
                    tempHp: 6,
                    items: [createEarthFeatureItem()],
                    proficiencyBonus: 3
                })
                const changed = {
                    system: {
                        attributes: {
                            hp: {
                                temp: 6
                            }
                        }
                    }
                }
                const harness = createHarness()

                try {
                    const callback = harness.callback("preUpdateActor")
                    expect(callback).to.be.a("function")

                    callback(
                        actor,
                        changed,
                        {
                            transformations: {
                                temporaryHpGain: 5
                            }
                        },
                        "user-1"
                    )

                    expect(changed.system.attributes.hp.temp).to.equal(8)
                } finally {
                    harness.restore()
                }
            })

            it("does not add proficiency bonus when temporary HP is reduced", function()
            {
                const actor = createActor({
                    tempHp: 9,
                    items: [createEarthFeatureItem()],
                    proficiencyBonus: 3
                })
                const changed = {
                    system: {
                        attributes: {
                            hp: {
                                temp: 4
                            }
                        }
                    }
                }
                const harness = createHarness()

                try {
                    const callback = harness.callback("preUpdateActor")
                    expect(callback).to.be.a("function")

                    callback(actor, changed, {}, "user-1")

                    expect(changed.system.attributes.hp.temp).to.equal(4)
                } finally {
                    harness.restore()
                }
            })

            it("does not add proficiency bonus without the Earth feature", function()
            {
                const actor = createActor({
                    proficiencyBonus: 3
                })
                const changed = {
                    system: {
                        attributes: {
                            hp: {
                                temp: 5
                            }
                        }
                    }
                }
                const harness = createHarness()

                try {
                    const callback = harness.callback("preUpdateActor")
                    expect(callback).to.be.a("function")

                    callback(actor, changed, {}, "user-1")

                    expect(changed.system.attributes.hp.temp).to.equal(5)
                } finally {
                    harness.restore()
                }
            })
        })
    }
)
