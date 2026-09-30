import { Seraph } from "../../../../domain/transformation/subclasses/seraph/Seraph.js"
import {
    CLEANSE_AFFLICTION_UUID,
    CleanseAffliction,
    DIVINE_CLEMENCY_UUID
} from "../../../../domain/transformation/subclasses/seraph/Feats/CleanseAffliction.js"
import {
    SERAPH_CORRUPTION_EFFECT_UUID,
    SeraphCorruption
} from "../../../../domain/transformation/subclasses/seraph/Feats/SeraphCorruption.js"

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

            it("clears Temporary Hit Points and the attack round when applied", async function()
            {
                const actor = createActor({temp: 8})
                await SeraphCorruption.onCorruptionApplied(actor)

                expect(actor.updates).to.deep.equal([{
                    "flags.transformations.seraph.-=corruptionAttackRound": null,
                    "system.attributes.hp.temp": 0
                }])
            })
        })
    }
)
