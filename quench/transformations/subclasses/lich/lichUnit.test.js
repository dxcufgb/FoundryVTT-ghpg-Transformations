import { Lich } from "../../../../domain/transformation/subclasses/lich/Lich.js"
import { isSoulVesselCharged } from "../../../../domain/transformation/subclasses/lich/soulVessel.js"
import { LichMagicaRegainSpellSlots } from "../../../../domain/transformation/subclasses/lich/activities/LichMagicaRegainSpellSlots.js"
import { MemoriLichdomNecroticDamage } from "../../../../domain/transformation/subclasses/lich/activities/memoriLichdomNecroticDamage.js"
import { onPreRollDamage } from "../../../../domain/transformation/subclasses/lich/triggers/onPreRollDamage.js"
import { conditionsMet } from "../../../../domain/actions/conditionSchema.js"
import { onBloodied } from "../../../../domain/transformation/subclasses/lich/triggers/onBloodied.js"
import { onConcentration } from "../../../../domain/transformation/subclasses/lich/triggers/onConcentration.js"
import { onUnconscious } from "../../../../domain/transformation/subclasses/lich/triggers/onUnconscious.js"

const SOUL_VESSEL_UUID = "Compendium.transformations.gh-transformations.Item.rluvw9sNdr3JO93n"
const MEMORI_LICHDOM_UUID = "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"

function createSoulVessel(spent)
{
    return {
        name: "Soul Vessel",
        flags: {transformations: {sourceUuid: SOUL_VESSEL_UUID}},
        system: {uses: {max: 1, spent}}
    }
}

function createEffect(uuid, {
    name = "Concentrating",
    concentrating = true,
    changes = [],
    flags = {}
} = {})
{
    const effect = {
        uuid,
        name,
        changes,
        flags,
        statuses: new Set(concentrating ? ["concentrating"] : []),
        deleted: false,
        async setFlag(scope, key, value)
        {
            this.flags[scope] ??= {}
            this.flags[scope][key] = value
        },
        async delete()
        {
            this.deleted = true
        }
    }
    return effect
}

function createEldritchEffect(uuid, flags = {})
{
    return createEffect(uuid, {
        name: "Eldritch Concentration",
        concentrating: false,
        changes: [{key: "system.attributes.concentration.limit", mode: 2, value: "1"}],
        flags
    })
}

quench.registerBatch(
    "transformations.subClasses.lich.unit",
    ({describe, it, expect}) =>
    {
        describe("Soul Vessel charge", function()
        {
            it("is charged only while the vessel has a use left", function()
            {
                expect(isSoulVesselCharged({items: [createSoulVessel(0)]})).to.equal(true)
                expect(isSoulVesselCharged({items: [createSoulVessel(1)]})).to.equal(false)
                expect(isSoulVesselCharged({items: []})).to.equal(false)
            })

            it("caches the charged state synchronously before the update", function()
            {
                const options = {}
                const result = Lich.preUpdateItem({
                    item: createSoulVessel(1),
                    changed: {system: {uses: {spent: 0}}},
                    options
                })

                expect(result).to.equal(true)
                expect(options.transformations.lich.soulVesselCharged).to.equal(true)
            })

            it("writes a boolean flag when no cached state reaches the update", async function()
            {
                const updates = []
                const actor = {
                    flags: {},
                    async update(data)
                    {
                        updates.push(data)
                    }
                }

                await Lich.updateItem({
                    item: createSoulVessel(0),
                    changed: {system: {uses: {spent: 0}}},
                    actor,
                    options: {}
                })

                expect(updates).to.deep.equal([
                    {"flags.transformations.lich.soulVesselCharged": true}
                ])
            })
        })

        describe("Lich Magica enforce disadvantage", function()
        {
            function createAttacker(deleted)
            {
                return {
                    effects: [{
                        id: "enforce",
                        name: "Enforce Disadvantage",
                        origin: "Actor.a.Item.b.ActiveEffect.dQzYsMWKJw6E7rKc",
                        async delete()
                        {
                            deleted.push(this.id)
                        }
                    }]
                }
            }

            it("imposes Disadvantage on a save against the Lich's spell", async function()
            {
                const deleted = []
                const context = {workflow: {item: {type: "spell"}}}

                await Lich.onPreRollSavingThrowAsAttacker(context, createAttacker(deleted))

                expect(context.disadvantage).to.equal(true)
                expect(deleted).to.deep.equal(["enforce"])
            })

            it("ignores a save that is not against a spell", async function()
            {
                const deleted = []
                const context = {workflow: {item: {type: "weapon"}}}

                await Lich.onPreRollSavingThrowAsAttacker(context, createAttacker(deleted))

                expect(context.disadvantage).to.equal(undefined)
                expect(deleted).to.deep.equal([])
            })
        })

        describe("Hideous Appearance", function()
        {
            function getSaveBody(trigger)
            {
                return trigger.actionGroups[0].actions[0].data.flavor.body
            }

            it("describes the trigger that called for the save", function()
            {
                expect(getSaveBody(onBloodied)).to.contain("Bloodied")
                expect(getSaveBody(onConcentration)).to.contain("concentrating")
                expect(getSaveBody(onUnconscious)).to.contain("Unconscious")

                for (const trigger of [onBloodied, onConcentration, onUnconscious]) {
                    expect(getSaveBody(trigger)).to.contain("Hideous Appearance")
                    expect(getSaveBody(trigger)).to.not.contain("Horrific")
                }
            })
        })

        describe("Memori Lichdom", function()
        {
            function createDamageContext(soulVesselCharged)
            {
                return {
                    damage: {
                        current: {
                            itemDocument: {
                                type: "weapon",
                                actor: {
                                    flags: {transformations: {lich: {soulVesselCharged}}}
                                }
                            }
                        }
                    }
                }
            }

            const actor = {
                items: [{flags: {transformations: {sourceUuid: MEMORI_LICHDOM_UUID}}}]
            }
            const group = onPreRollDamage.actionGroups[0]

            it("offers Force damage only while the soul vessel is charged", function()
            {
                expect(conditionsMet(actor, group.when, createDamageContext(true))).to.equal(true)
                expect(conditionsMet(actor, group.when, createDamageContext(false))).to.equal(false)
                expect(conditionsMet(actor, group.when, createDamageContext(undefined))).to.equal(false)
            })

            it("does not offer the Necrotic Hit Die roll while the soul vessel is uncharged", async function()
            {
                const originalWarn = ui.notifications.warn
                ui.notifications.warn = () => {}
                let messageUpdated = false
                try {
                    await MemoriLichdomNecroticDamage.activityUse({
                        actor: {items: [createSoulVessel(1)]},
                        message: {
                            async update()
                            {
                                messageUpdated = true
                            }
                        },
                        actorRepository: {},
                        ChatMessagePartInjector: {}
                    })
                } finally {
                    ui.notifications.warn = originalWarn
                }

                expect(messageUpdated).to.equal(false)
            })
        })

        describe("Lich Magica regain spell slot", function()
        {
            it("keeps the card open when the slot dialog is closed without a choice", async function()
            {
                let messageUpdated = false
                const completed = await LichMagicaRegainSpellSlots.recoverSpellSlot({
                    actor: {flags: {transformations: {stage: 1}}, system: {spells: {}}},
                    message: {
                        async update()
                        {
                            messageUpdated = true
                        }
                    },
                    dialogFactory: {
                        async openTransformationsSpellSlotRecovery()
                        {
                            return null
                        }
                    },
                    ChatMessagePartInjector: {}
                })

                expect(completed).to.equal(false)
                expect(messageUpdated).to.equal(false)
            })
        })

        describe("Eldritch Concentration", function()
        {
            it("makes the Eldritch Concentration effect depend on the original concentration", async function()
            {
                const original = createEffect("Actor.a.ActiveEffect.original")
                const eldritch = createEldritchEffect("Actor.a.ActiveEffect.eldritch")
                const actor = {effects: [original, eldritch]}

                await Lich.createActiveEffect({effect: eldritch, actor})

                expect(eldritch.flags.dnd5e.dependentOn).to.equal(original.uuid)
            })

            it("makes the second concentration depend on the Eldritch Concentration effect", async function()
            {
                const original = createEffect("Actor.a.ActiveEffect.original")
                const eldritch = createEldritchEffect("Actor.a.ActiveEffect.eldritch", {
                    dnd5e: {dependentOn: original.uuid}
                })
                const second = createEffect("Actor.a.ActiveEffect.second")
                const third = createEffect("Actor.a.ActiveEffect.third")
                const actor = {effects: [original, eldritch, second]}

                await Lich.createActiveEffect({effect: second, actor})

                expect(second.flags.dnd5e.dependentOn).to.equal(eldritch.uuid)
                expect(eldritch.flags.transformations.eldritchConcentrationSecondUuid).to.equal(second.uuid)

                actor.effects.push(third)
                await Lich.createActiveEffect({effect: third, actor})

                expect(third.flags.dnd5e?.dependentOn).to.equal(undefined)
            })

            it("ends the original concentration when the second one ends", async function()
            {
                const original = createEffect("Actor.a.ActiveEffect.original")
                const second = createEffect("Actor.a.ActiveEffect.second")
                const eldritch = createEldritchEffect("Actor.a.ActiveEffect.eldritch", {
                    dnd5e: {dependentOn: original.uuid},
                    transformations: {eldritchConcentrationSecondUuid: second.uuid}
                })
                const ended = []
                const actor = {
                    effects: [original, eldritch],
                    async endConcentration(effect)
                    {
                        ended.push(effect)
                    }
                }

                await Lich.deleteActiveEffect({effect: second, actor})

                expect(ended).to.deep.equal([original])
            })
        })
    }
)
