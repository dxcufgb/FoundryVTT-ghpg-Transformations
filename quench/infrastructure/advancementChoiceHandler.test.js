import { createAdvancementChoiceHandler } from "../../infrastructure/foundry/advancementChoiceHandler.js"

const ADD_MODE = globalThis.CONST?.ACTIVE_EFFECT_MODES?.ADD ?? 2
const UPGRADE_MODE = globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

function createActor(
    skillValues = {},
    saveProficiencies = {},
    traitValues = {}
)
{
    return {
        id: "actor-1",
        uuid: "Actor.actor-1",
        system: {
            abilities: {
                str: {proficient: saveProficiencies.str ?? 0},
                dex: {proficient: saveProficiencies.dex ?? 0},
                con: {proficient: saveProficiencies.con ?? 0},
                int: {proficient: saveProficiencies.int ?? 0},
                wis: {proficient: saveProficiencies.wis ?? 0},
                cha: {proficient: saveProficiencies.cha ?? 0}
            },
            skills: {
                acr: {value: skillValues.acr ?? 0},
                arc: {value: skillValues.arc ?? 0},
                ath: {value: skillValues.ath ?? 0},
                sur: {value: skillValues.sur ?? 0}
            },
            traits: {
                dr: {
                    value: new Set(traitValues.resistances ?? [])
                },
                di: {
                    value: new Set(traitValues.immunities ?? [])
                }
            }
        }
    }
}

function createHandler({
    dialogResult = "acid",
    stageDialogResult = "Compendium.transformations.gh-transformations.Item.sKoEV2o2qWnMSxMW",
    createResult = {id: "effect-1"}
} = {})
{
    const calls = {
        dialog: [],
        stageDialog: [],
        createdEffects: []
    }

    const handler = createAdvancementChoiceHandler({
        activeEffectRepository: {
            async create(effectData)
            {
                calls.createdEffects.push(effectData)
                return createResult
            }
        },
        getDialogFactory: () => ({
            async openTransformationGeneralChoiceDialog(data)
            {
                calls.dialog.push(data)
                return typeof dialogResult === "function"
                    ? dialogResult(data)
                    : dialogResult
            },
            async openStageChoiceDialog(data)
            {
                calls.stageDialog.push(data)
                return typeof stageDialogResult === "function"
                    ? stageDialogResult(data)
                    : stageDialogResult
            }
        }),
        logger: createLogger()
    })

    return {
        calls,
        handler
    }
}

quench.registerBatch(
    "transformations.infrastructure.advancementChoiceHandler",
    ({describe, it, expect}) =>
    {
        describe("createAdvancementChoiceHandler", function ()
        {
            it("opens the choice dialog and creates a hidden damage resistance effect", async function ()
            {
                const actor = createActor()
                const {calls, handler} = createHandler({
                    dialogResult: "acid"
                })

                const result = await handler.choose({
                    actor,
                    advancementChoices: [
                        "dr:acid",
                        "dr:cold",
                        "dr:fire"
                    ],
                    title: "Fallback title",
                    description: "Fallback description"
                })

                expect(result).to.equal(true)
                expect(calls.dialog).to.have.length(1)
                expect(calls.dialog[0].choices).to.deep.equal([
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
                expect(calls.dialog[0].title).to.equal("Choose damage resistance")
                expect(calls.dialog[0].description).to.equal(
                    "Choose 1 damage resistance from the available options."
                )
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0]).to.deep.equal({
                    actor,
                    name: "Damage Resistance: Acid",
                    label: "Acid",
                    description: "Gain resistance to acid damage.",
                    source: "transformation",
                    icon: "modules/transformations/icons/damageTypes/Acid.png",
                    origin: "Actor.actor-1",
                    resistanceIdentifier: "acid",
                    changes: [
                        {
                            key: "system.traits.dr.value",
                            mode: ADD_MODE,
                            value: "acid"
                        }
                    ],
                    flags: {
                        dnd5e: {
                            hidden: true
                        },
                        transformations: {
                            advancementChoice: "dr:acid",
                            advancementChoiceType: "damageResistance"
                        }
                    }
                })
            })

            it(
                "passes a clamped multi-choice count to the dialog and applies each selected damage resistance",
                async function ()
                {
                    const {calls, handler} = createHandler({
                        dialogResult: ["acid", "cold"]
                    })

                    const result = await handler.choose({
                        actor: createActor(),
                        advancementChoices: [
                            "dr:acid",
                            "dr:cold"
                        ],
                        numberOfChoices: 5
                    })

                    expect(result).to.equal(true)
                    expect(calls.dialog).to.have.length(1)
                    expect(calls.dialog[0].choiceCount).to.equal(2)
                    expect(calls.createdEffects.map(effect => effect.resistanceIdentifier))
                    .to.deep.equal(["acid", "cold"])
                }
            )

            it("returns false when the dialog is cancelled", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: null
                })

                const result = await handler.choose({
                    actor: createActor(),
                    advancementChoices: ["dr:acid"]
                })

                expect(result).to.equal(false)
                expect(calls.createdEffects).to.have.length(0)
            })

            it("returns null when advancement choices mix different handler types", async function ()
            {
                const {calls, handler} = createHandler()

                const result = await handler.choose({
                    actor: createActor(),
                    advancementChoices: [
                        "dr:acid",
                        "skills:arc"
                    ]
                })

                expect(result).to.equal(null)
                expect(calls.dialog).to.have.length(0)
                expect(calls.createdEffects).to.have.length(0)
            })

            it("expands the skills wildcard into all registered skill choices", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "arc"
                })

                await handler.choose({
                    actor: createActor({arc: 1}),
                    advancementChoices: ["skills:*"]
                })

                expect(calls.dialog).to.have.length(1)
                expect(calls.dialog[0].title).to.equal("Choose skill")
                expect(calls.dialog[0].description).to.equal(
                    "Choose 1 skill from the available options."
                )
                expect(calls.dialog[0].choices).to.have.length(18)
                expect(calls.dialog[0].choices[0]).to.deep.equal({
                    icon: "modules/transformations/icons/skills/Acrobatics.png",
                    id: "acr",
                    label: "Acrobatics",
                    raw: "skills:acr",
                    value: "acr",
                    mode: "forcedExpertise"
                })
                expect(
                    calls.dialog[0].choices.some(choice =>
                        choice.id === "sur" && choice.label === "Survival"
                    )
                ).to.equal(true)
            })

            it("opens the choice dialog and creates a hidden saving throw proficiency effect", async function ()
            {
                const actor = createActor()
                const {calls, handler} = createHandler({
                    dialogResult: "str"
                })

                const result = await handler.choose({
                    actor,
                    advancementChoices: [
                        "saves:str",
                        "saves:dex"
                    ]
                })

                expect(result).to.equal(true)
                expect(calls.dialog).to.have.length(1)
                expect(calls.dialog[0].choices).to.deep.equal([
                    {
                        icon: "modules/transformations/icons/abilities/Strength.svg",
                        id: "str",
                        label: "Strength",
                        raw: "saves:str",
                        value: "str"
                    },
                    {
                        icon: "modules/transformations/icons/abilities/Dexterity.svg",
                        id: "dex",
                        label: "Dexterity",
                        raw: "saves:dex",
                        value: "dex"
                    }
                ])
                expect(calls.dialog[0].title).to.equal(
                    "Choose saving throw proficiency"
                )
                expect(calls.dialog[0].description).to.equal(
                    "Choose 1 saving throw proficiency from the available options."
                )
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0]).to.deep.equal({
                    actor,
                    name: "Saving Throw Proficiency: Strength",
                    label: "Strength",
                    description: "Gain proficiency in strength saving throws.",
                    source: "transformation",
                    icon: "modules/transformations/icons/abilities/Strength.svg",
                    origin: "Actor.actor-1",
                    saveIdentifier: "str",
                    changes: [
                        {
                            key: "system.abilities.str.proficient",
                            mode: UPGRADE_MODE,
                            value: 1
                        }
                    ],
                    flags: {
                        dnd5e: {
                            hidden: true
                        },
                        transformations: {
                            advancementChoice: "saves:str",
                            advancementChoiceType: "save"
                        }
                    }
                })
            })

            it("expands the saves wildcard into all registered save choices", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "wis"
                })

                await handler.choose({
                    actor: createActor(),
                    advancementChoices: ["saves:*"]
                })

                expect(calls.dialog).to.have.length(1)
                expect(calls.dialog[0].title).to.equal(
                    "Choose saving throw proficiency"
                )
                expect(calls.dialog[0].description).to.equal(
                    "Choose 1 saving throw proficiency from the available options."
                )
                expect(calls.dialog[0].choices).to.have.length(6)
                expect(calls.dialog[0].choices[0]).to.deep.equal({
                    icon: "modules/transformations/icons/abilities/Strength.svg",
                    id: "str",
                    label: "Strength",
                    raw: "saves:str",
                    value: "str"
                })
                expect(
                    calls.dialog[0].choices.some(choice =>
                        choice.id === "cha" && choice.label === "Charisma"
                    )
                ).to.equal(true)
            })

            it("creates an expertise effect for forcedExpertise skill choices", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "arc"
                })

                const result = await handler.choose({
                    actor: createActor(),
                    advancementChoices: ["skills:arc:forcedExpertise"]
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0].name).to.equal("Skill Expertise: Arcana")
                expect(calls.createdEffects[0].description).to.equal("Gain expertise in Arcana.")
                expect(calls.createdEffects[0].changes).to.deep.equal([
                    {
                        key: "system.skills.arc.value",
                        mode: UPGRADE_MODE,
                        value: 2
                    }
                ])
                expect(calls.createdEffects[0].flags).to.deep.equal({
                    dnd5e: {
                        hidden: true
                    },
                    transformations: {
                        advancementChoice: "skills:arc:forcedExpertise",
                        advancementChoiceType: "skill",
                        advancementChoiceMode: "forcedExpertise"
                    }
                })
            })

            it("creates proficiency instead of expertise for upgrade mode on an untrained skill", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "arc"
                })

                const result = await handler.choose({
                    actor: createActor({arc: 0}),
                    advancementChoices: ["skills:arc:upgrade"]
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0].name).to.equal("Skill Proficiency: Arcana")
                expect(calls.createdEffects[0].description).to.equal("Gain proficiency in Arcana.")
                expect(calls.createdEffects[0].changes[0].value).to.equal(1)
            })

            it("creates expertise for upgrade mode on a proficient skill", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "arc"
                })

                const result = await handler.choose({
                    actor: createActor({arc: 1}),
                    advancementChoices: ["skills:arc:upgrade"]
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0].name).to.equal("Skill Expertise: Arcana")
                expect(calls.createdEffects[0].changes[0].value).to.equal(2)
            })

            it("does not create an effect for expertise mode if the actor is not proficient", async function ()
            {
                const {calls, handler} = createHandler({
                    dialogResult: "arc"
                })

                const result = await handler.choose({
                    actor: createActor({arc: 0}),
                    advancementChoices: ["skills:arc:expertise"]
                })

                expect(result).to.equal(false)
                expect(calls.createdEffects).to.have.length(0)
            })

            it("returns effect payloads without applying them when apply is false", async function ()
            {
                const actor = createActor()
                const {calls, handler} = createHandler({
                    dialogResult: ["acid", "cold"]
                })

                const result = await handler.choose({
                    actor,
                    advancementChoices: [
                        "dr:acid",
                        "dr:cold"
                    ],
                    numberOfChoices: 2,
                    apply: false
                })

                expect(calls.createdEffects).to.have.length(0)
                expect(result).to.deep.equal([
                    {
                        actor,
                        changes: [
                            {
                                key: "system.traits.dr.value",
                                mode: ADD_MODE,
                                value: "acid"
                            }
                        ],
                        description: "Gain resistance to acid damage.",
                        flags: {
                            dnd5e: {
                                hidden: true
                            },
                            transformations: {
                                advancementChoice: "dr:acid",
                                advancementChoiceType: "damageResistance"
                            }
                        },
                        icon: "modules/transformations/icons/damageTypes/Acid.png",
                        label: "Acid",
                        name: "Damage Resistance: Acid",
                        origin: "Actor.actor-1",
                        resistanceIdentifier: "acid",
                        source: "transformation"
                    },
                    {
                        actor,
                        changes: [
                            {
                                key: "system.traits.dr.value",
                                mode: ADD_MODE,
                                value: "cold"
                            }
                        ],
                        description: "Gain resistance to cold damage.",
                        flags: {
                            dnd5e: {
                                hidden: true
                            },
                            transformations: {
                                advancementChoice: "dr:cold",
                                advancementChoiceType: "damageResistance"
                            }
                        },
                        icon: "modules/transformations/icons/damageTypes/Cold.png",
                        label: "Cold",
                        name: "Damage Resistance: Cold",
                        origin: "Actor.actor-1",
                        resistanceIdentifier: "cold",
                        source: "transformation"
                    }
                ])
            })

            it("upgrades a damage resistance choice to immunity when the source item requests upgrade and the actor already resists the chosen type", async function ()
            {
                const actor = createActor({}, {}, {
                    resistances: ["acid"]
                })
                const sourceItem = {
                    uuid: "Compendium.transformations.gh-transformations.Item.parent",
                    flags: {
                        transformations: {
                            advancementOverride: "upgrade"
                        }
                    }
                }
                const {calls, handler} = createHandler({
                    dialogResult: "acid"
                })

                const result = await handler.choose({
                    actor,
                    sourceItem,
                    advancementChoices: ["dr:acid"]
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0]).to.deep.equal({
                    actor,
                    name: "Damage Immunity: Acid",
                    label: "Acid",
                    description: "Gain immunity to acid damage.",
                    source: "transformation",
                    icon: "modules/transformations/icons/damageTypes/Acid.png",
                    origin: "Compendium.transformations.gh-transformations.Item.parent",
                    resistanceIdentifier: "acid",
                    changes: [
                        {
                            key: "system.traits.di.value",
                            mode: ADD_MODE,
                            value: "acid"
                        }
                    ],
                    flags: {
                        dnd5e: {
                            hidden: true
                        },
                        transformations: {
                            advancementChoice: "dr:acid",
                            advancementChoiceType: "damageResistance"
                        }
                    }
                })
            })

            it("resolves raw test-environment damage resistance selections before applying them", async function ()
            {
                const actor = createActor()
                const {calls, handler} = createHandler()
                const originalEnvironment =
                    globalThis.___TransformationTestEnvironment___

                globalThis.___TransformationTestEnvironment___ = {
                    choosenAdvancement: [
                        {
                            name: "Primeval Body",
                            choice: "dr:fire"
                        }
                    ]
                }

                try {
                    const result = await handler.choose({
                        actor,
                        sourceItem: {
                            name: "Primeval Body",
                            uuid:
                                "Compendium.transformations.gh-transformations.Item.gQZ0xl368qBi0zzP"
                        },
                        advancementChoices: [
                            "dr:bludgeoning",
                            "dr:cold",
                            "dr:fire",
                            "dr:lightning"
                        ]
                    })

                    expect(result).to.equal(true)
                    expect(calls.dialog).to.have.length(0)
                    expect(calls.createdEffects).to.have.length(1)
                    expect(calls.createdEffects[0]).to.deep.equal({
                        actor,
                        name: "Damage Resistance: Fire",
                        label: "Fire",
                        description: "Gain resistance to fire damage.",
                        source: "transformation",
                        icon: "modules/transformations/icons/damageTypes/Fire.png",
                        origin:
                            "Compendium.transformations.gh-transformations.Item.gQZ0xl368qBi0zzP",
                        resistanceIdentifier: "fire",
                        changes: [
                            {
                                key: "system.traits.dr.value",
                                mode: ADD_MODE,
                                value: "fire"
                            }
                        ],
                        flags: {
                            dnd5e: {
                                hidden: true
                            },
                            transformations: {
                                advancementChoice: "dr:fire",
                                advancementChoiceType: "damageResistance"
                            }
                        }
                    })
                } finally {
                    if (originalEnvironment === undefined) {
                        delete globalThis.___TransformationTestEnvironment___
                    } else {
                        globalThis.___TransformationTestEnvironment___ =
                            originalEnvironment
                    }
                }
            })

            it("opens the transformation choice dialog for item pool choices", async function ()
            {
                const actor = createActor()
                const sourceItem = {
                    id: "parent-item-1",
                    name: "Parent Item",
                    uuid: "Item.parent-item-1"
                }
                const {calls, handler} = createHandler({
                    stageDialogResult: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                })

                const result = await handler.chooseItemPool({
                    actor,
                    sourceItem,
                    itemChoices: [
                        {
                            uuid: "Compendium.transformations.gh-transformations.Item.sKoEV2o2qWnMSxMW",
                            name: "First Choice",
                            img: "first.png",
                            description: "<p>First</p>"
                        },
                        {
                            uuid: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU",
                            name: "Second Choice",
                            img: "second.png",
                            description: "<p>Second</p>"
                        }
                    ]
                })

                expect(calls.dialog).to.have.length(0)
                expect(calls.stageDialog).to.have.length(1)
                expect(calls.stageDialog[0].actor).to.equal(actor)
                expect(calls.stageDialog[0].choices.map(choice => choice.uuid))
                .to.deep.equal([
                    "Compendium.transformations.gh-transformations.Item.sKoEV2o2qWnMSxMW",
                    "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                ])
                expect(calls.stageDialog[0].stage).to.equal("advancement-parent-item-1")
                expect(result).to.deep.equal({
                    uuid: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU",
                    name: "Second Choice",
                    img: "second.png",
                    description: "<p>Second</p>"
                })
            })
        })
    }
)
