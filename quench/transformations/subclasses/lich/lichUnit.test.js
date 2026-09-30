import { Lich } from "../../../../domain/transformation/subclasses/lich/Lich.js"
import { isSoulVesselCharged } from "../../../../domain/transformation/subclasses/lich/soulVessel.js"
import { LichMagicaRegainSpellSlots } from "../../../../domain/transformation/subclasses/lich/activities/LichMagicaRegainSpellSlots.js"
import { MemoriLichdomNecroticDamage } from "../../../../domain/transformation/subclasses/lich/activities/memoriLichdomNecroticDamage.js"
import { onPreRollDamage } from "../../../../domain/transformation/subclasses/lich/triggers/onPreRollDamage.js"
import { conditionsMet } from "../../../../domain/actions/conditionSchema.js"

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
