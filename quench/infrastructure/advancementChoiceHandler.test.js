import { createAdvancementChoiceHandler } from "../../infrastructure/foundry/advancementChoiceHandler.js"

quench.registerBatch(
    "transformations.infrastructure.advancementChoiceHandler",
    ({ describe, it, expect }) =>
    {
        describe("createAdvancementChoiceHandler", function()
        {
            it("opens the choice dialog and creates a hidden damage resistance effect", async function()
            {
                const handler = createAdvancementChoiceHandler({
                    activeEffectRepository: {
                        async create(effectData)
                        {
                            expect(effectData.name).to.equal(
                                "Damage Resistance: Acid"
                            )
                            expect(effectData.description).to.equal(
                                "Gain resistance to acid damage."
                            )
                            expect(effectData.icon).to.equal(
                                "modules/transformations/icons/damageTypes/Acid.png"
                            )
                            expect(effectData.flags).to.deep.equal({
                                dnd5e: {
                                    hidden: true
                                },
                                transformations: {
                                    advancementChoice: "dr:acid",
                                    advancementChoiceType: "damageResistance"
                                }
                            })
                            expect(effectData.changes).to.deep.equal([
                                {
                                    key: "system.traits.dr.value",
                                    mode: 2,
                                    value: "acid"
                                }
                            ])

                            return { id: "effect-1" }
                        }
                    },
                    getDialogFactory: () => ({
                        async openTransformationGeneralChoiceDialog({
                            choices,
                            title,
                            description
                        })
                        {
                            expect(choices).to.deep.equal([
                                {
                                    icon: "modules/transformations/icons/damageTypes/Acid.png",
                                    id: "acid",
                                    label: "Acid",
                                    raw: "dr:acid",
                                    value: "acid"
                                },
                                {
                                    icon: "modules/transformations/icons/damageTypes/Cold.png",
                                    id: "cold",
                                    label: "Cold",
                                    raw: "dr:cold",
                                    value: "cold"
                                },
                                {
                                    icon: "modules/transformations/icons/damageTypes/Fire.png",
                                    id: "fire",
                                    label: "Fire",
                                    raw: "dr:fire",
                                    value: "fire"
                                }
                            ])
                            expect(title).to.equal("Choose damage resistance")
                            expect(description).to.equal(
                                "Choose one damage resistance from the available options."
                            )

                            return "acid"
                        }
                    }),
                    logger: {
                        debug() { },
                        warn() { }
                    }
                })

                const result = await handler.choose({
                    actor: { id: "actor-1" },
                    advancementChoices: [
                        "dr:acid",
                        "dr:cold",
                        "dr:fire"
                    ],
                    title: "Fallback title",
                    description: "Fallback description"
                })

                expect(result).to.equal(true)
            })
        })
    }
)
