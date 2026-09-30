import { Seraph } from "../../../../domain/transformation/subclasses/seraph/Seraph.js"
import {
    CLEANSE_AFFLICTION_UUID,
    CleanseAffliction,
    DIVINE_CLEMENCY_UUID
} from "../../../../domain/transformation/subclasses/seraph/Feats/CleanseAffliction.js"
import {
    SERAPH_CORRUPTION_EFFECT_UUID,
    SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG,
    SeraphCorruption
} from "../../../../domain/transformation/subclasses/seraph/Feats/SeraphCorruption.js"
import {
    HOLY_PURGE,
    RIGHTEOUS_MERCY,
    SeraphAuras
} from "../../../../domain/transformation/subclasses/seraph/Feats/SeraphAuras.js"

function createItem({
    id = "item-1",
    name = "Item",
    type = "feat",
    identifier = "",
    sourceUuid = null,
    flags = {}
} = {})
{
    return {
        id,
        name,
        type,
        uuid: `Actor.actor-1.Item.${id}`,
        system: {identifier},
        flags: {
            ...flags,
            transformations: sourceUuid ? {sourceUuid} : {}
        }
    }
}

function createActor({items = [], effects = [], statuses = [], temp = 0} = {})
{
    const byId = new Map(items.map(item => [item.id, item]))
    const itemList = Object.assign([...items], {
        get: id => byId.get(id) ?? null
    })

    return {
        id: "actor-1",
        uuid: "Actor.actor-1",
        isOwner: true,
        items: itemList,
        appliedEffects: effects,
        effects,
        statuses: new Set(statuses),
        flags: {transformations: {}},
        system: {attributes: {hp: {value: 5, max: 20, temp}}},
        updates: [],
        flagWrites: [],
        async update(data)
        {
            this.updates.push(data)
        },
        async setFlag(scope, key, value)
        {
            this.flagWrites.push({scope, key, value})
            foundry.utils.setProperty(this.flags, `${scope}.${key}`, value)
        }
    }
}

function createCorruptionEffect(id = "corruption-1")
{
    return {
        id,
        name: "Seraph Corruption",
        disabled: false,
        isSuppressed: false,
        flags: {transformations: {sourceUuid: SERAPH_CORRUPTION_EFFECT_UUID}}
    }
}

function createSaveContext(itemType = "spell")
{
    return {
        workflow: {item: {type: itemType}},
        rolls: [{options: {}}]
    }
}

quench.registerBatch(
    "transformations.subClasses.seraph.unit",
    ({describe, it, expect}) =>
    {
        describe("Seraph flaw activities", function()
        {
            it("does not call for a Blinding Radiance save when a flaw activity is used", async function()
            {
                for (const identifier of ["beacon-to-darkness", "seraph-corruption"]) {
                    const usage = {workflow: {item: createItem({identifier})}}
                    const result = await Seraph.onActivityUse({}, usage)

                    expect(result?.skipActivityUseTrigger, identifier).to.equal(true)
                }
            })

            it("still calls for a Blinding Radiance save for a Seraph power", async function()
            {
                const usage = {workflow: {item: createItem({identifier: "bow-of-celestial-judgement"})}}
                const result = await Seraph.onActivityUse({}, usage)

                expect(result?.skipActivityUseTrigger).to.equal(false)
            })
        })

        describe("Cleanse Affliction", function()
        {
            it("recognises the Healing Word cast through Divine Clemency", function()
            {
                const clemency = createItem({
                    id: "clemency",
                    name: "Divine Clemency",
                    identifier: "divine-clemency",
                    sourceUuid: DIVINE_CLEMENCY_UUID
                })
                const actor = createActor({items: [clemency]})
                const spell = {
                    type: "spell",
                    actor,
                    flags: {dnd5e: {cachedFor: ".Item.clemency.Activity.h5fiDFD23tgQiuSX"}},
                    system: {}
                }

                expect(CleanseAffliction.isDivineClemencySpellUse({
                    usage: {workflow: {item: spell}}
                })).to.equal(true)
            })

            it("ignores a Healing Word cast with a spell slot", function()
            {
                const spell = {type: "spell", flags: {}, system: {}}

                expect(CleanseAffliction.isDivineClemencySpellUse({
                    usage: {workflow: {item: spell}}
                })).to.equal(false)
            })

            it("finds the Cleanse Affliction item by its source", function()
            {
                const actor = createActor({
                    items: [createItem({id: "cleanse", sourceUuid: CLEANSE_AFFLICTION_UUID})]
                })

                expect(CleanseAffliction.findCleanseAfflictionItem(actor)?.id).to.equal("cleanse")
                expect(CleanseAffliction.findCleanseAfflictionItem(createActor())).to.equal(null)
            })

            it("reads the healed amount from the midi damage list", function()
            {
                const target = createActor()
                const originalFromUuidSync = globalThis.fromUuidSync
                globalThis.fromUuidSync = uuid => (uuid === target.uuid ? target : null)

                try {
                    const healed = CleanseAffliction.collectHealedTargets({
                        damageList: [
                            {actorUuid: target.uuid, oldHP: 5, newHP: 12},
                            {actorUuid: target.uuid, oldHP: 12, newHP: 8}
                        ]
                    })

                    expect(healed).to.have.length(1)
                    expect(healed[0].actor).to.equal(target)
                    expect(healed[0].healed).to.equal(7)

                    const fullHp = CleanseAffliction.collectHealedTargets({
                        damageList: [
                            {actorUuid: target.uuid, oldHP: 20, newHP: 20, healingAdjustedTotalDamage: -6}
                        ]
                    })

                    expect(fullHp).to.have.length(1)
                    expect(fullHp[0].healed).to.equal(0)
                } finally {
                    globalThis.fromUuidSync = originalFromUuidSync
                }
            })

            it("grants Temporary Hit Points equal to the healing without lowering existing ones", async function()
            {
                const target = createActor({temp: 3})
                await CleanseAffliction.grantTemporaryHitPoints(target, 7)
                expect(target.updates).to.deep.equal([{"system.attributes.hp.temp": 7}])

                const sturdy = createActor({temp: 10})
                await CleanseAffliction.grantTemporaryHitPoints(sturdy, 7)
                expect(sturdy.updates).to.have.length(0)
            })

            it("builds a one minute Advantage effect", function()
            {
                const effectData = CleanseAffliction.buildAdvantageEffectData(
                    {_id: "d4cbJwirFGhBLBy2", name: "Roll Advantage", transfer: false, duration: {seconds: null}},
                    {uuid: "Actor.actor-1.Item.cleanse"}
                )

                expect(effectData._id).to.equal(undefined)
                expect(effectData.transfer).to.equal(false)
                expect(effectData.origin).to.equal("Actor.actor-1.Item.cleanse")
                expect(effectData.duration.seconds).to.equal(60)
            })

            it("only offers the conditions the feature can end", function()
            {
                const target = createActor({statuses: ["poisoned", "prone", "blinded"]})

                expect(CleanseAffliction.getRemovableConditions(target)).to.deep.equal([
                    "blinded",
                    "poisoned"
                ])
            })
        })

        describe("Seraph Corruption", function()
        {
            it("records the round of the first attack while corrupted", async function()
            {
                const actor = createActor({effects: [createCorruptionEffect()]})

                expect(await SeraphCorruption.recordAttack(actor)).to.equal(true)
                expect(actor.flagWrites).to.deep.equal([{
                    scope: "transformations",
                    key: "seraph.corruptionAttackRound",
                    value: SeraphCorruption.getCombatRound()
                }])
                expect(await SeraphCorruption.recordAttack(actor)).to.equal(false)
            })

            it("does not record attacks when not corrupted", async function()
            {
                const actor = createActor()

                expect(await SeraphCorruption.recordAttack(actor)).to.equal(false)
                expect(actor.flagWrites).to.have.length(0)
            })

            it("gives Advantage to the first spell save of the round only", function()
            {
                SeraphCorruption.resetSpellSaveTracking()
                const attacker = createActor({effects: [createCorruptionEffect()]})

                const first = createSaveContext()
                expect(SeraphCorruption.applySpellSaveAdvantage(first, attacker)).to.equal(true)
                expect(first.advantage).to.equal(true)
                expect(first.rolls[0].options.advantage).to.equal(true)

                const second = createSaveContext()
                expect(SeraphCorruption.applySpellSaveAdvantage(second, attacker)).to.equal(false)
                expect(second.advantage).to.equal(undefined)

                SeraphCorruption.resetSpellSaveTracking()
            })

            it("does not give Advantage against non-spell saves", function()
            {
                SeraphCorruption.resetSpellSaveTracking()
                const attacker = createActor({effects: [createCorruptionEffect()]})
                const context = createSaveContext("feat")

                expect(SeraphCorruption.applySpellSaveAdvantage(context, attacker)).to.equal(false)
                expect(context.advantage).to.equal(undefined)
            })

            it("records the spell save round on the Seraph so other clients see it", function()
            {
                SeraphCorruption.resetSpellSaveTracking()
                const effect = createCorruptionEffect()
                const attacker = createActor({effects: [effect]})

                expect(SeraphCorruption.applySpellSaveAdvantage(createSaveContext(), attacker)).to.equal(true)
                expect(attacker.flagWrites).to.deep.equal([{
                    scope: "transformations",
                    key: SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG,
                    value: SeraphCorruption.getSpellSaveRoundKey(effect)
                }])

                SeraphCorruption.resetSpellSaveTracking()
            })

            it("does not give Advantage when another client already used it this round", function()
            {
                SeraphCorruption.resetSpellSaveTracking()
                const effect = createCorruptionEffect()
                const attacker = createActor({effects: [effect]})
                foundry.utils.setProperty(
                    attacker.flags,
                    `transformations.${SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG}`,
                    SeraphCorruption.getSpellSaveRoundKey(effect)
                )

                const context = createSaveContext()
                expect(SeraphCorruption.applySpellSaveAdvantage(context, attacker)).to.equal(false)
                expect(context.advantage).to.equal(undefined)
            })

            it("records the spell save round through the GM when the saving client can't update the Seraph", function()
            {
                SeraphCorruption.resetSpellSaveTracking()
                const effect = createCorruptionEffect()
                const attacker = Object.assign(createActor({effects: [effect]}), {isOwner: false})
                const calls = []
                const originalMidi = globalThis.MidiQOL
                globalThis.MidiQOL = {
                    socket: () => ({
                        executeAsGM: async (name, payload) => calls.push({name, payload})
                    })
                }

                try {
                    expect(SeraphCorruption.applySpellSaveAdvantage(createSaveContext(), attacker)).to.equal(true)
                    expect(attacker.flagWrites).to.have.length(0)
                    expect(calls).to.deep.equal([{
                        name: "updateActor",
                        payload: {
                            actorUuid: attacker.uuid,
                            updates: {
                                [`flags.transformations.${SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG}`]:
                                    SeraphCorruption.getSpellSaveRoundKey(effect)
                            }
                        }
                    }])
                } finally {
                    globalThis.MidiQOL = originalMidi
                    SeraphCorruption.resetSpellSaveTracking()
                }
            })

            it("clears Temporary Hit Points and the attack round when applied", async function()
            {
                const actor = createActor({temp: 8})
                await SeraphCorruption.onCorruptionApplied(actor)

                expect(actor.updates).to.deep.equal([{
                    "flags.transformations.seraph.-=corruptionAttackRound": null,
                    "flags.transformations.seraph.-=corruptionSpellSaveRound": null,
                    "system.attributes.hp.temp": 0
                }])
            })
        })

        describe("Seraph auras", function()
        {
            function createAuraActor({
                id,
                hp = 10,
                exhaustion = 0,
                effects = [],
                statuses = []
            } = {})
            {
                const actor = createActor({effects, statuses})
                actor.id = id
                actor.uuid = `Actor.${id}`
                actor.name = id
                actor.system.attributes.hp.value = hp
                actor.system.attributes.exhaustion = exhaustion
                actor.createdEffects = []
                actor.update = async function(data, options = {})
                {
                    this.updates.push({data, options})
                    for (const [path, value] of Object.entries(data)) {
                        foundry.utils.setProperty(this, path, value)
                    }
                }
                actor.createEmbeddedDocuments = async function(type, data)
                {
                    this.createdEffects.push(...data)
                    this.effects.push(...data)
                    return data
                }
                return actor
            }

            function setUpAura(auraKey, {seraphStatuses = []} = {})
            {
                const definition = SeraphAuras.getDefinition(auraKey)
                const seraph = createAuraActor({id: "seraph", statuses: seraphStatuses})
                const sourceItem = {
                    documentName: "Item",
                    actor: seraph,
                    parent: seraph,
                    system: {identifier: definition.identifier},
                    flags: {},
                    _stats: {}
                }
                const sourceEffect = {
                    uuid: `Actor.seraph.Item.aura.ActiveEffect.${auraKey}`,
                    name: definition.name,
                    parent: sourceItem
                }
                const auraEffect = {
                    id: `applied-${auraKey}`,
                    name: definition.name,
                    origin: sourceEffect.uuid,
                    disabled: false,
                    isSuppressed: false,
                    flags: {auraeffects: {fromAura: true}}
                }
                const ally = createAuraActor({id: "ally", effects: [auraEffect]})

                return {seraph, ally, sourceEffect}
            }

            async function withStubs({sourceEffect, midi = {}}, callback)
            {
                const originalFromUuidSync = globalThis.fromUuidSync
                const originalMidi = globalThis.MidiQOL
                globalThis.fromUuidSync = uuid => (uuid === sourceEffect?.uuid ? sourceEffect : null)
                globalThis.MidiQOL = {
                    hasUsedReaction: () => false,
                    setReactionUsed: async () => true,
                    ...midi
                }

                try {
                    return await callback()
                } finally {
                    globalThis.fromUuidSync = originalFromUuidSync
                    globalThis.MidiQOL = originalMidi
                    SeraphAuras.resetPendingRighteousMercy()
                }
            }

            function dialogReturning(choice)
            {
                return {
                    openTransformationGeneralChoiceDialog: async () => choice
                }
            }

            it("finds the Seraph behind an aura applied to an ally", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)

                await withStubs({sourceEffect}, () =>
                {
                    expect(SeraphAuras.findAuraContext(ally, RIGHTEOUS_MERCY)?.seraph).to.equal(seraph)
                    expect(SeraphAuras.findAuraContext(ally, HOLY_PURGE)).to.equal(null)
                })
            })

            it("ignores the aura while the Seraph is Unconscious", async function()
            {
                const {ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY, {seraphStatuses: ["unconscious"]})

                await withStubs({sourceEffect}, () =>
                {
                    expect(SeraphAuras.findAuraContext(ally, RIGHTEOUS_MERCY)).to.equal(null)
                })
            })

            it("holds an ally in the Aura of Righteous Mercy at 1 Hit Point instead of 0", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)

                await withStubs({sourceEffect}, () =>
                {
                    const changed = {system: {attributes: {hp: {value: 0}}}}
                    const options = {}

                    expect(SeraphAuras.onPreUpdateActor(ally, changed, options, "user")).to.equal(true)
                    expect(changed.system.attributes.hp.value).to.equal(1)
                    expect(options.transformations.righteousMercyHeld.seraphUuid).to.equal(seraph.uuid)
                })
            })

            it("does not hold the ally when the damage leaves it above 0 Hit Points", async function()
            {
                const {ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)

                await withStubs({sourceEffect}, () =>
                {
                    const changed = {system: {attributes: {hp: {value: 3}}}}
                    expect(SeraphAuras.onPreUpdateActor(ally, changed, {}, "user")).to.equal(false)
                    expect(changed.system.attributes.hp.value).to.equal(3)
                })
            })

            it("does not hold the ally once it used the aura since its last Long Rest", async function()
            {
                const {ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)
                ally.effects.push(SeraphAuras.buildUsedMarkerData(RIGHTEOUS_MERCY))

                await withStubs({sourceEffect}, () =>
                {
                    const changed = {system: {attributes: {hp: {value: 0}}}}
                    expect(SeraphAuras.onPreUpdateActor(ally, changed, {}, "user")).to.equal(false)
                    expect(changed.system.attributes.hp.value).to.equal(0)
                })
            })

            it("does not hold the ally when its Reaction is already used", async function()
            {
                const {ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)

                await withStubs({sourceEffect, midi: {hasUsedReaction: () => true}}, () =>
                {
                    const changed = {system: {attributes: {hp: {value: 0}}}}
                    expect(SeraphAuras.onPreUpdateActor(ally, changed, {}, "user")).to.equal(false)
                })
            })

            it("does not intercept its own follow-up Hit Point update", async function()
            {
                const {ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)

                await withStubs({sourceEffect}, () =>
                {
                    const changed = {system: {attributes: {hp: {value: 0}}}}
                    const options = {transformations: {righteousMercy: true}}
                    expect(SeraphAuras.onPreUpdateActor(ally, changed, options, "user")).to.equal(false)
                })
            })

            it("gives both creatures Exhaustion and marks the ally when Righteous Mercy is used", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)
                ally.system.attributes.hp.value = 1
                ally.system.attributes.exhaustion = 1
                const reactions = []

                await withStubs({sourceEffect, midi: {setReactionUsed: async actor => reactions.push(actor)}}, async () =>
                {
                    const used = await SeraphAuras.resolveRighteousMercy({
                        actor: ally,
                        seraph,
                        dialogFactory: dialogReturning("use"),
                        postMessage: false
                    })

                    expect(used).to.equal(true)
                    expect(ally.system.attributes.hp.value).to.equal(1)
                    expect(ally.system.attributes.exhaustion).to.equal(2)
                    expect(seraph.system.attributes.exhaustion).to.equal(1)
                    expect(reactions).to.deep.equal([ally])
                    expect(ally.createdEffects).to.have.length(1)
                    expect(ally.createdEffects[0].flags.transformations.seraphAuraUsed).to.equal(RIGHTEOUS_MERCY)
                    expect(ally.createdEffects[0].flags.dae.specialDuration).to.deep.equal(["longRest"])
                    expect(SeraphAuras.hasUsedAura(ally, RIGHTEOUS_MERCY)).to.equal(true)
                })
            })

            it("lets the ally drop to 0 Hit Points when Righteous Mercy is declined", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)
                ally.system.attributes.hp.value = 1

                await withStubs({sourceEffect}, async () =>
                {
                    const used = await SeraphAuras.resolveRighteousMercy({
                        actor: ally,
                        seraph,
                        dialogFactory: dialogReturning("decline"),
                        postMessage: false
                    })

                    expect(used).to.equal(false)
                    expect(ally.system.attributes.hp.value).to.equal(0)
                    expect(ally.updates[0].options.transformations.righteousMercy).to.equal(true)
                    expect(ally.system.attributes.exhaustion).to.equal(0)
                    expect(seraph.system.attributes.exhaustion).to.equal(0)
                    expect(ally.createdEffects).to.have.length(0)
                })
            })

            it("treats an unanswered Righteous Mercy prompt as declined", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(RIGHTEOUS_MERCY)
                ally.system.attributes.hp.value = 1

                await withStubs({sourceEffect}, async () =>
                {
                    const used = await SeraphAuras.resolveRighteousMercy({
                        actor: ally,
                        seraph,
                        dialogFactory: {openTransformationGeneralChoiceDialog: () => new Promise(() => {})},
                        timeoutMs: 10,
                        postMessage: false
                    })

                    expect(used).to.equal(false)
                    expect(ally.system.attributes.hp.value).to.equal(0)
                })
            })

            it("gives both creatures Exhaustion and blocks the optional when Holy Purge is used", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(HOLY_PURGE)

                await withStubs({sourceEffect}, async () =>
                {
                    await SeraphAuras.onHolyPurgeUsed({actor: ally, postMessage: false})

                    expect(ally.system.attributes.exhaustion).to.equal(1)
                    expect(seraph.system.attributes.exhaustion).to.equal(1)
                    expect(ally.createdEffects).to.have.length(1)

                    const marker = ally.createdEffects[0]
                    expect(marker.flags.transformations.seraphAuraUsed).to.equal(HOLY_PURGE)
                    expect(marker.flags.dae.specialDuration).to.deep.equal(["longRest"])
                    expect(marker.changes).to.deep.equal([{
                        key: "flags.midi-qol.optional.holyPurge.countAlt",
                        mode: 5,
                        value: "-1",
                        priority: 20
                    }])
                })
            })

            it("does not add Exhaustion past the maximum", async function()
            {
                const {seraph, ally, sourceEffect} = setUpAura(HOLY_PURGE)
                const max = Number(CONFIG.DND5E?.conditionTypes?.exhaustion?.levels ?? 6) || 6
                seraph.system.attributes.exhaustion = max

                await withStubs({sourceEffect}, async () =>
                {
                    await SeraphAuras.onHolyPurgeUsed({actor: ally, postMessage: false})

                    expect(seraph.system.attributes.exhaustion).to.equal(max)
                    expect(ally.system.attributes.exhaustion).to.equal(1)
                })
            })
        })
    }
)
