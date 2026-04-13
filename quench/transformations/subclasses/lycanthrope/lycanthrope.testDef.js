import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";

const placeholderChoices = Object.freeze([
    {name: "Lycanthrope Stage 1 Choice A", uuid: ""},
    {name: "Lycanthrope Stage 1 Choice B", uuid: ""},
    {name: "Lycanthrope Stage 2 Choice A", uuid: ""},
    {name: "Lycanthrope Stage 2 Choice B", uuid: ""},
    {name: "Lycanthrope Stage 3 Choice A", uuid: ""},
    {name: "Lycanthrope Stage 3 Choice B", uuid: ""},
    {name: "Lycanthrope Stage 4 Choice A", uuid: ""},
    {name: "Lycanthrope Stage 4 Choice B", uuid: ""}
])

const LycanthropeForms = [
    {
        name: "Hybrid Wolf Form",
        hybridFrom: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
        formUuid: "Compendium.transformations.creatures.Actor.WexEE2d1QwzEvAUa",
        effectActivityName: "Apply Hybrid Wolf effect",
        effect: {
            name: "Hybrid Wolf Form",
            changes: [
                {
                    key: "system.abilities.str.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                    value: 18
                },
                {
                    key: "system.attributes.movement.bonus",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 10
                },
                {
                    key: "system.traits.languages.custom",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "Your ability to speak is reduced to short basic guttural responses"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.eVUH5GeBkB61uMbg"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.4XwffwdkK1n7ehJj"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.o2FZSdm3Uh2bu9x6"
                },
                {
                    key: "flags.transformations.lycanthrope.hybridForm",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: 1
                }
            ]
        },
        kindredForm: {
            name: "Kindred Form: Wolf",
            formUuid: "Compendium.transformations.creatures.Actor.R6uXrPnTdWhBYHkI"
        }
    },
    {
        name: "Hybrid Bear Form",
        hybridFrom: "Compendium.transformations.gh-transformations.Item.CSIQIM4rTZt2eul4",
        formUuid: "Compendium.transformations.creatures.Actor.ynpVNMtsu9Wzt3Jm",
        effectActivityName: "Apply Hybrid Bear Effect",
        effect: {
            name: "Hybrid Bear Form",
            changes: [
                {
                    key: "system.abilities.str.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                    value: 20
                },
                {
                    key: "system.attributes.movement.climb",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: 30
                },
                {
                    key: "system.traits.languages.custom",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "Your ability to speak is reduced to short basic guttural responses"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.4XwffwdkK1n7ehJj"
                },
                {
                    key: "flags.transformations.lycanthrope.hybridForm",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: 1
                }
            ]
        },
        extraActivity: {
            name: "Escape grapple",
            targets: {
                amount: 1,
                type: "creature"
            },
            saveDC: (actor) => {return (8 + actor.system.abilities.str.mod + actor.system.attributes.prof)},
            saveAbility: "str"
        },
        kindredForm: {
            name: "Kindred Form: Bear",
            formUuid: "Compendium.transformations.creatures.Actor.0SouwvicxOCMcQVL"
        }
    },
    {
        name: "Hybrid Rat Form",
        hybridFrom: "Compendium.transformations.gh-transformations.Item.Wk2EIMS6AcMFoaSv",
        formUuid: "Compendium.transformations.creatures.Actor.JqDEE1UJGf9KCpkr",
        effectActivityName: "Apply Hybrid Rat Effect",
        effect: {
            name: "Hybrid Rat Form",
            changes: [
                {
                    key: "system.abilities.dex.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                    value: 18
                },
                {
                    key: "system.traits.languages.custom",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "Your ability to speak is reduced to short basic guttural responses"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.eVUH5GeBkB61uMbg"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.4XwffwdkK1n7ehJj"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.o2FZSdm3Uh2bu9x6"
                },
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: "Compendium.transformations.gh-transformations.Item.oIEpysqxNtPgmgiw"
                },
                {
                    key: "flags.transformations.lycanthrope.hybridForm",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: 1
                }
            ]
        },
        kindredForm: {
            name: "Kindred Form: Rat",
            formUuid: "Compendium.transformations.creatures.Actor.QoWaPiY2BzgLO6d6"
        }
    }
]

export const lycanthropeTestDef = {
    id: "lycanthrope",
    name: "Lycanthrope",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: [
        {
            name: (loopVars) => `stage 1 with ${loopVars.name}`,
            loop: () => LycanthropeForms,

            steps: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.hybridFrom,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.SfMTYtdWXJOeCVX7",
                    loopVars.hybridFrom
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Monstrosity"
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Lust for the Hunt"
                    item.uses.max = 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.period = "sr"
                        recovery.type = "recoverAll"
                    })
                    item.addActivity(activity => {
                        activity.name = "Start of turn Saving throw"
                        activity.activationType = "special"
                        activity.saveDc = 10
                        activity.saveAbility = ["wis"]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.itemName = loopVars.name
                    item.addActivity(activity => {
                        activity.name = "Midi Transform"
                        activity.activationType = "action"
                        activity.duration.value = 1
                        activity.duration.units = "hour"
                        activity.settings.effects = ["all"]
                        activity.settings.keep = ["self"]
                        activity.settings.merge = ["saves", "skills"]
                        activity.transformationChoices = [loopVars.formUuid]
                    })
                    item.addActivity(activity => {
                        activity.name = loopVars.effectActivityName
                        activity.activationType = ""
                        activity.duration.value = 1
                        activity.duration.units = "hour"
                        activity.addEffect(effect => {
                            effect.name = loopVars.effect.name
                            effect.changes = loopVars.effect.changes
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = loopVars.kindredForm.name
                        activity.activationType = "special"
                        activity.transformationChoices = [loopVars.kindredForm.formUuid]
                    })
                    if (loopVars.extraActivity) {
                        const calculatedDC = loopVars.extraActivity.saveDC(actor)
                        item.addActivity(activity => {
                            activity.name = loopVars.extraActivity.name
                            activity.target.affects.count = loopVars.extraActivity.targets.amount
                            activity.target.affects.type = loopVars.extraActivity.targets.type
                            activity.saveDc = calculatedDC
                            activity.saveAbility = [loopVars.extraActivity.saveAbility]
                            activity.activationType = ""
                        })
                    }
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Hunter’s Focus`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.8U5fr6IwtSqVHCO4",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.8U5fr6IwtSqVHCO4",
                    "Compendium.transformations.gh-transformations.Item.XdPwwrl91fjc9JMY"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Hunter’s Focus"
                    item.addActivity(activity => {
                        activity.name = "Mark Enemy"
                        activity.activationType = "bonus"
                        activity.duration.units = "hour"
                        activity.duration.value = 1
                        activity.range.value = 60
                        activity.range.unit = "ft"
                        activity.target.value = 1
                        activity.addEffect(effect => {
                            effect.name = "Hunter’s Mark"
                            effect.changes = [
                                {
                                    key: "flags.transformations.lycanthrope.huntersMark",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: 1
                                }
                            ]
                        })
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Silver Sensitivity"
                    item.addEffect(effect => {
                        effect.name = "Silver Sensitivity"
                        effect.changes = [
                            {
                                "key": "system.traits.dv.value",
                                "value": "bludgeoning",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dv.value",
                                "value": "piercing",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dv.value",
                                "value": "slashing",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dv.bypasses",
                                "value": "ada",
                                "mode": 0
                            },
                            {
                                "key": "system.traits.dv.bypasses",
                                "value": "mgc",
                                "mode": 0
                            }
                        ]
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Iron Pelt`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.G5LNiZBdQu2AYuSC",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.G5LNiZBdQu2AYuSC"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Iron Pelt"
                    item.addEffect(effect => {
                        effect.name = "Iron Pelt"
                        effect.description = "While in hybrid form, you have Resistance to Bludgeoning, Piercing, and Slashing damage. Magical and silvered weapons ignore this resistance."
                        effect.changes = [
                            {
                                "key": "system.traits.dr.value",
                                "value": "bludgeoning",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dr.value",
                                "value": "piercing",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dr.value",
                                "value": "slashing",
                                "mode": 2
                            },
                            {
                                "key": "system.traits.dr.bypasses",
                                "value": "mgc",
                                "mode": 0
                            },
                            {
                                "key": "system.traits.dr.bypasses",
                                "value": "sil",
                                "mode": 0
                            }
                        ]
                        effect.flags = {
                            dae: {
                                enableCondition: "@flags.transformations.lycanthrope.hybridForm == 1"
                            }
                        }
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Kindred Form`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Kindred Form"
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Bestial Vigor`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.ML93ufjDC9nIprs6",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.ML93ufjDC9nIprs6",
                    "Compendium.transformations.gh-transformations.Item.iv0DZ6tbH0U0TNi2"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Frayed Thoughts"
                    item.addEffect(effect => {
                        effect.name = "Frayed Thoughts"
                        effect.description = "You have Disadvantage on Intelligence ability checks and saving throws."
                        effect.changes = [
                            {
                                key: "system.abilities.int.check.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            },
                            {
                                key: "system.abilities.int.save.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Bestial Vigor"
                    item.addEffect(effect => {
                        effect.name = "Bestial Vigor"
                        effect.description = "Your Hit Point Maximum increases by an amount equal to your character level, and it increases by 1 every time you gain a character level."
                        effect.changes = [
                            {
                                key: "system.attributes.hp.bonuses.level",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                    })
                    item.addActivity(activity => {
                        activity.name = "Bestial Vigor"
                        activity.activationType = "turnStart"
                        activity.healing.formula = "5"
                        activity.healing.type = "temp"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Shapeshifter’s Savagery`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.9bwCUcoYrRhHL9Mh",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.9bwCUcoYrRhHL9Mh"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Shapeshifter’s Savagery"
                    item.addEffect(effect => {
                        effect.name = "Shapeshifter’s Savagery"
                        effect.description = "You have Immunity to the Charmed and Frightened conditions."
                        effect.changes = [
                            {
                                key: "system.traits.ci.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "frightened"
                            },
                            {
                                key: "system.traits.ci.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "charmed"
                            }
                        ]
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Hybrid Form Affinity`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.9bwCUcoYrRhHL9Mh",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.IKbEWxQP01NILuq6",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.IKbEWxQP01NILuq6",
                    "Compendium.transformations.gh-transformations.Item.EqE7zKj2fzb1iBlR"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Hybrid Form Affinity"
                    item.addEffect(effect => {
                        effect.name = "Hybrid Form Affinity"
                        effect.changes = [
                            {
                                key: "system.abilities.wis.check.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            },
                            {
                                key: "system.abilities.wis.save.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                        effect.flags = {
                            "ActiveAuras": {
                                "isAura": true,
                                "aura": "Allies",
                                "nameOverride": "",
                                "radius": "20",
                                "alignment": "",
                                "type": "",
                                "customCheck": "",
                                "ignoreSelf": true,
                                "height": false,
                                "hidden": false,
                                "displayTemp": true,
                                "hostile": false,
                                "onlyOnce": false,
                                "wallsBlock": "true"
                            }
                        }
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Ultimate Predator"
                    item.addActivity(activity => {
                        activity.name = "Involuntary Transformation Save"
                        activity.saveDc = 15
                        activity.saveAbility = ["wis"]
                        activity.addEffect(effect => {
                            effect.name = "Ultimate Predator"
                            effect.changes = [
                                {
                                    key: "macro.itemMacro",
                                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                    value: "lycanthrope triggerBloodiedHybridTransform"
                                }
                            ]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Savage Instincts`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.sdbu5ta4xyeaFaNU",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.9bwCUcoYrRhHL9Mh",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.nnZFTTr8OfkHoj8A",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.nnZFTTr8OfkHoj8A"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Savage Instincts"
                    item.addActivity(activity => {
                        activity.name = "Hit on Bloodied Creature"
                        activity.activationType = "special"
                        activity.range.units = "spec"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "1d8"
                            damagePart.damageTypes = ["slashing"]
                        })
                        activity.critical.allow = true
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: []
}
