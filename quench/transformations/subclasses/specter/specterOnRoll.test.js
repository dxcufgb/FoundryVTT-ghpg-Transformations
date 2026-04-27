import { Specter } from "../../../../domain/transformation/subclasses/specter/Specter.js"

const FRAYING_REALITY_DAMAGE_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.gIZ5Gzc4nCAkiUQ6"

quench.registerBatch(
    "transformations.subClasses.specter.onRoll",
    ({describe, it, expect}) =>
    {
        describe("Specter.onRoll", function()
        {
            it("uses Midi Damage when a d20 roll is a natural 1 and the actor has the fraying reality item", async function()
            {
                let callCount = 0
                const activity = {
                    name: "Midi Damage",
                    async use()
                    {
                        callCount += 1
                    }
                }
                const actor = {
                    items: [
                        {
                            flags: {
                                transformations: {
                                    sourceUuid: FRAYING_REALITY_DAMAGE_ITEM_UUID
                                }
                            },
                            system: {
                                activities: [activity]
                            }
                        }
                    ]
                }

                await Specter.onRoll(actor, {
                    hookName: "dnd5e.rollAttack",
                    natural: 1,
                    total: 4
                })

                expect(callCount).to.equal(1)
            })

            it("does nothing when the roll is not a natural 1", async function()
            {
                let callCount = 0
                const actor = {
                    items: [
                        {
                            flags: {
                                transformations: {
                                    sourceUuid: FRAYING_REALITY_DAMAGE_ITEM_UUID
                                }
                            },
                            system: {
                                activities: [
                                    {
                                        name: "Midi Damage",
                                        async use()
                                        {
                                            callCount += 1
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }

                await Specter.onRoll(actor, {
                    hookName: "dnd5e.rollSavingThrow",
                    natural: 2,
                    total: 7
                })

                expect(callCount).to.equal(0)
            })
        })
    }
)
