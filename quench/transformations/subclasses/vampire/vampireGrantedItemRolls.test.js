import { REGENERATION_RADIANT_EFFECT_NAME, REGENERATION_RADIANT_FLAG_KEY, Vampire } from "../../../../domain/transformation/subclasses/vampire/Vampire.js"

const SANGROMANCY_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"
const REGENERATION_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.TKHTXSYMDDTYBVWW"

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

        describe("Vampire Regeneration Radiant suppression", function ()
        {
            it("marks Regeneration suppressed when Radiant damage is taken on another combatant's turn", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: false
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 6
                    })

                    expect(actor.createdEffects).to.have.length(1)
                    const [effect] = actor.createdEffects
                    expect(effect.name).to.equal(REGENERATION_RADIANT_EFFECT_NAME)
                    expect(effect.changes[0].key).to.equal(REGENERATION_RADIANT_FLAG_KEY)
                    expect(effect.changes[0].value).to.equal("1")
                    expect(effect.flags.dae.specialDuration).to.include("turnEnd")
                    expect(effect.flags.dae.specialDuration).to.include("combatEnd")
                    expect(effect.duration.startRound).to.equal(2)
                    expect(effect.duration.startTurn).to.equal(0)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("detects Radiant in a mixed-type hit from the applied damage types", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: false
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 11,
                        details: {},
                        damageType: "slashing",
                        appliedDamageTypes: ["slashing", "radiant"]
                    })

                    expect(actor.createdEffects).to.have.length(1)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("falls back to the resolved damage type when no applied types are known", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: false
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 6,
                        appliedDamageTypes: []
                    })

                    expect(actor.createdEffects).to.have.length(1)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("does not reject when the Radiant marker cannot be created", async function ()
            {
                const actor = createRegenerationActor()
                actor.createEmbeddedDocuments = async function ()
                {
                    throw new Error("no permission")
                }
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: false
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 6
                    })
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("ignores Radiant damage taken during the vampire's own turn", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: true
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 6
                    })

                    expect(actor.createdEffects).to.have.length(0)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("ignores fully resisted Radiant damage and non-Radiant damage", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    ownTurn: false
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 0,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 0
                    })
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "fire",
                        appliedDamage: 6
                    })

                    expect(actor.createdEffects).to.have.length(0)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("does nothing without Regeneration or when already suppressed", async function ()
            {
                const withoutRegeneration = createRegenerationActor({
                    hasRegeneration: false
                })
                const alreadySuppressed = createRegenerationActor({
                    effects: [{name: REGENERATION_RADIANT_EFFECT_NAME}]
                })
                const combatEnvironment = installCombatEnvironment({
                    actor: withoutRegeneration,
                    extraActors: [alreadySuppressed],
                    ownTurn: false
                })

                try {
                    for (const actor of [withoutRegeneration, alreadySuppressed]) {
                        await Vampire.onPreCalculateDamage({
                            actor,
                            target: actor,
                            damage: 6,
                            details: {},
                            damageType: "radiant",
                            appliedDamage: 6
                        })
                    }

                    expect(withoutRegeneration.createdEffects).to.have.length(0)
                    expect(alreadySuppressed.createdEffects).to.have.length(0)
                } finally {
                    combatEnvironment.restore()
                }
            })

            it("does nothing outside combat", async function ()
            {
                const actor = createRegenerationActor()
                const combatEnvironment = installCombatEnvironment({
                    actor,
                    combat: null
                })

                try {
                    await Vampire.onPreCalculateDamage({
                        actor,
                        target: actor,
                        damage: 6,
                        details: {},
                        damageType: "radiant",
                        appliedDamage: 6
                    })

                    expect(actor.createdEffects).to.have.length(0)
                } finally {
                    combatEnvironment.restore()
                }
            })
        })
    }
)

let regenerationActorCounter = 0

function createRegenerationActor({
    hasRegeneration = true,
    effects = []
} = {})
{
    regenerationActorCounter += 1
    const actor = createActor()
    actor.id = `regeneration-actor-${regenerationActorCounter}`
    actor.uuid = `Actor.${actor.id}`
    actor.items = hasRegeneration
        ? [
            {
                name: "Regeneration",
                flags: {
                    transformations: {
                        sourceUuid: REGENERATION_ITEM_UUID
                    }
                }
            }
        ]
        : []
    actor.effects = [...effects]
    actor.createdEffects = []
    actor.createEmbeddedDocuments = async function (type, data)
    {
        if (type === "ActiveEffect") {
            this.createdEffects.push(...data)
            this.effects.push(...data)
        }
        return data
    }

    return actor
}

function installCombatEnvironment({
    actor,
    extraActors = [],
    ownTurn = false,
    combat = undefined
} = {})
{
    const game = globalThis.game
    const originalDescriptor = Object.getOwnPropertyDescriptor(game, "combat")
    const combatants = [
        {
            id: "other-combatant",
            actor: {uuid: "Actor.other"}
        },
        ...[actor, ...extraActors].map((combatActor, index) => ({
            id: `vampire-combatant-${index}`,
            actor: combatActor
        }))
    ]
    const mockCombat = combat === undefined
        ? {
            started: true,
            round: 2,
            turn: 0,
            combatants,
            combatant: ownTurn ? combatants[1] : combatants[0]
        }
        : combat

    Object.defineProperty(game, "combat", {
        value: mockCombat,
        configurable: true,
        writable: true
    })

    return {
        restore()
        {
            if (originalDescriptor) {
                Object.defineProperty(game, "combat", originalDescriptor)
            } else {
                delete game.combat
            }
        }
    }
}

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
