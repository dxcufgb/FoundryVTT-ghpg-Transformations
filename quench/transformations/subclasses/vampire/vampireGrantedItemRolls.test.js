import { Vampire } from "../../../../domain/transformation/subclasses/vampire/Vampire.js"

const SANGROMANCY_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"

quench.registerBatch(
    "transformations.subClasses.vampire.grantedItemRolls",
    ({describe, it, expect}) =>
    {
        describe("Vampire.maybeRollSangromancyHitDie", function ()
        {
            it("does nothing for non-matching granted items", async function ()
            {
                const actor = createActor()
                const rollEnvironment = installRollEnvironment({total: 8})

                try {
                    const result = await Vampire.maybeRollSangromancyHitDie(
                        actor,
                        {
                            flags: {
                                transformations: {
                                    sourceUuid:
                                        "Compendium.transformations.gh-transformations.Item.not-sangromancy"
                                }
                            }
                        }
                    )

                    expect(result).to.equal(null)
                    expect(rollEnvironment.calls.formulas).to.have.length(0)
                    expect(actor.getFlag(
                        "transformations",
                        "vampire.sangromancyHitDieMax"
                    )).to.equal(null)
                } finally {
                    rollEnvironment.restore()
                }
            })

            for (const scenario of createSourceUuidDetectionScenarios()) {
                it(`detects the Sangromancy source UUID from ${scenario.name}`, async function ()
                {
                    const actor = createActor()
                    const rollEnvironment = installRollEnvironment({total: 10})

                    try {
                        const result = await Vampire.maybeRollSangromancyHitDie(
                            actor,
                            scenario.item
                        )

                        expect(result).to.equal(10)
                        expect(rollEnvironment.calls.formulas).to.deep.equal([
                            "1d12"
                        ])
                        expect(rollEnvironment.calls.messages).to.have.length(1)
                        expect(actor.getFlag(
                            "transformations",
                            "vampire.sangromancyHitDieMax"
                        )).to.equal(10)
                    } finally {
                        rollEnvironment.restore()
                    }
                })
            }

            it("does not overwrite an existing Sangromancy hit die maximum", async function ()
            {
                const actor = createActor({
                    sangromancyHitDieMax: 9
                })
                const rollEnvironment = installRollEnvironment({total: 4})

                try {
                    const result = await Vampire.maybeRollSangromancyHitDie(
                        actor,
                        {
                            flags: {
                                transformations: {
                                    sourceUuid: SANGROMANCY_ITEM_UUID
                                }
                            }
                        }
                    )

                    expect(result).to.equal(9)
                    expect(rollEnvironment.calls.formulas).to.have.length(0)
                    expect(actor.getFlag(
                        "transformations",
                        "vampire.sangromancyHitDieMax"
                    )).to.equal(9)
                } finally {
                    rollEnvironment.restore()
                }
            })

            it("does not save the flag when the roll total is invalid", async function ()
            {
                const actor = createActor()
                const rollEnvironment = installRollEnvironment({total: null})

                try {
                    const result = await Vampire.maybeRollSangromancyHitDie(
                        actor,
                        {
                            flags: {
                                transformations: {
                                    sourceUuid: SANGROMANCY_ITEM_UUID
                                }
                            }
                        }
                    )

                    expect(result).to.equal(null)
                    expect(actor.getFlag(
                        "transformations",
                        "vampire.sangromancyHitDieMax"
                    )).to.equal(null)
                } finally {
                    rollEnvironment.restore()
                }
            })

            it("does not roll twice when the same Sangromancy grant is processed concurrently", async function ()
            {
                const actor = createActor()
                const rollEnvironment = installRollEnvironment({
                    total: 12,
                    delayMs: 5
                })
                const item = {
                    flags: {
                        transformations: {
                            sourceUuid: SANGROMANCY_ITEM_UUID
                        }
                    }
                }

                try {
                    const results = await Promise.all([
                        Vampire.maybeRollSangromancyHitDie(actor, item),
                        Vampire.maybeRollSangromancyHitDie(actor, item)
                    ])

                    expect(results.filter(result => result != null)).to.deep.equal([
                        12
                    ])
                    expect(rollEnvironment.calls.formulas).to.have.length(1)
                    expect(actor.getFlag(
                        "transformations",
                        "vampire.sangromancyHitDieMax"
                    )).to.equal(12)
                } finally {
                    rollEnvironment.restore()
                }
            })
        })
    }
)

function createActor({
    sangromancyHitDieMax = null
} = {})
{
    const flags = {
        transformations: {
            vampire: {}
        }
    }

    if (sangromancyHitDieMax != null) {
        flags.transformations.vampire.sangromancyHitDieMax =
            sangromancyHitDieMax
    }

    return {
        id: "actor-1",
        uuid: "Actor.actor-1",
        flags,
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (!key) return scopeValue ?? null

            return key.split(".").reduce(
                (current, part) => current?.[part],
                scopeValue
            ) ?? null
        },
        async setFlag(scope, key, value)
        {
            this.flags[scope] ??= {}
            setProperty(this.flags[scope], key, value)
            return value
        }
    }
}

function createSourceUuidDetectionScenarios()
{
    return [
        {
            name: "transformations.sourceUuid",
            item: {
                flags: {
                    transformations: {
                        sourceUuid: SANGROMANCY_ITEM_UUID
                    }
                }
            }
        },
        {
            name: "core.sourceId",
            item: {
                flags: {
                    core: {
                        sourceId: SANGROMANCY_ITEM_UUID
                    }
                }
            }
        },
        {
            name: "_stats.compendiumSource",
            item: {
                _stats: {
                    compendiumSource: SANGROMANCY_ITEM_UUID
                }
            }
        },
        {
            name: "document.uuid",
            item: {
                uuid: SANGROMANCY_ITEM_UUID
            }
        }
    ]
}

function setProperty(target, path, value)
{
    const parts = path.split(".")
    let current = target

    while (parts.length > 1) {
        const key = parts.shift()
        if (!(key in current) || current[key] == null) {
            current[key] = {}
        }
        current = current[key]
    }

    current[parts[0]] = value
    return target
}

function installRollEnvironment({
    total = 7,
    delayMs = 0
} = {})
{
    const originalRoll = globalThis.Roll
    const originalChatMessage = globalThis.ChatMessage
    const calls = {
        formulas: [],
        messages: []
    }

    class TestRoll
    {
        constructor(formula)
        {
            this.formula = formula
            this.total = total
            calls.formulas.push(formula)
        }

        async roll()
        {
            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs))
            }

            return this
        }

        async toMessage(message)
        {
            calls.messages.push(message)
            return message
        }
    }

    globalThis.Roll = TestRoll
    globalThis.ChatMessage = {
        getSpeaker({actor} = {})
        {
            return {
                actor: actor?.id ?? null
            }
        }
    }

    return {
        calls,
        restore()
        {
            if (originalRoll === undefined) {
                delete globalThis.Roll
            } else {
                globalThis.Roll = originalRoll
            }

            if (originalChatMessage === undefined) {
                delete globalThis.ChatMessage
            } else {
                globalThis.ChatMessage = originalChatMessage
            }
        }
    }
}
