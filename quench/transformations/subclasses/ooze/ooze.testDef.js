import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";
import { ABILITY, ROLL_TYPE } from "../../../../config/constants.js";

const viscousDurabilityChoices = Object.freeze([
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
    },
    {
        icon: "modules/transformations/icons/damageTypes/Lightning.png",
        id: "lightning",
        label: "Lightning",
        raw: "dr:lightning",
        value: "lightning"
    }
])

export const oozeTestDef = {
    id: "ooze",
    name: "Ooze",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: `stage 1 with Mutable Corpus`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.tnQ6DL0epyIXWwkJ",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.movementSpeed = {
                    walk: 25
                }
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.tnQ6DL0epyIXWwkJ",
                    "Compendium.transformations.gh-transformations.Item.iLqzf9SpukItqJLJ",
                    "Compendium.transformations.gh-transformations.Item.oObOQpMmbXAVK9wA"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Ooze"
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Ooze Form"
                    item.addActivity(activity => {
                        activity.name = "Manifest Ooze Form"
                        activity.activationType = "bonus"
                        activity.duration.value = 1
                        activity.duration.units = "minute"
                        activity.addConsumption(consumption => {
                            consumption.numberOfConsumptions = 1
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                        })
                        activity.uses.max = actorProf + 1
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.transformationChoices = ["Compendium.transformations.creatures.Actor.nkJ5osLFTXcp0WzG"]
                    })
                    item.addActivity(activity => {
                        activity.name = "Ooze Form Effect"
                        activity.duration.value = 1
                        activity.duration.units = "minute"
                        activity.addEffect(effect => {
                            effect.name = "Manifested Ooze Form"
                            effect.changes = [
                                {
                                    key: "system.traits.ci.value",
                                    value: "grappled",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                                },
                                {
                                    key: "system.traits.ci.value",
                                    value: "restrained",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                                },
                                {
                                    key: "flags.transformations.ooze.oozeForm",
                                    value: "1",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                                },
                                {
                                    key: "macro.createItem",
                                    value: "Compendium.transformations.gh-transformations.Item.o28uVGWMiRiJvOcW",
                                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                                }
                            ]
                        })
                    })
                    item.addEffect(effect => {
                        effect.name = "Ooze Form"
                        effect.changes = [
                            {
                                key: "system.attributes.senses.blindsight",
                                mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
                                value: 30
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Sluggish"
                    item.addEffect(effect => {
                        effect.name = "Sluggish"
                        effect.changes = [
                            {
                                key: "system.attributes.movement.all",
                                value: "-5*(@flags.transformations.stage)",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Mutable Corpus"
                    item.addActivity(activity => {
                        activity.name = "Mutable Corpus"
                        activity.activationType = "special"
                        activity.addEffect(effect => {
                            effect.name = "Breathless"
                            effect.description = "You do not need to breathe."
                            effect.flags = {
                                dae: {
                                    enableCondition: "@flags.transformations.ooze.oozeForm == 1"
                                }
                            }
                        })
                        activity.addEffect(effect => {
                            effect.name = "Disguise"
                            effect.description = "You remold your features and body to look different. You can change your apparent species, seem 1 foot shorter or taller, and appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. To discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check with a DC equal to 10 plus your Constitution modifier plus your Transformation Stage."
                            effect.flags = {
                                dae: {
                                    enableCondition: "@flags.transformations.ooze.oozeForm == 1"
                                }
                            }
                        })
                        activity.addEffect(effect => {
                            effect.name = "Transparent"
                            effect.description = "You body becomes transparent. You have Advantage on Dexterity (Stealth) checks."
                            effect.flags = {
                                dae: {
                                    enableCondition: "@flags.transformations.ooze.oozeForm == 1"
                                }
                            }
                            effect.changes = [
                                {
                                    key: "system.abilities.dex.check.roll.mode",
                                    value: 1,
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD
                                }
                            ]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 1 with Slimy Mien`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.movementSpeed = {
                    walk: 25
                }
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Slimy Mien"
                    item.addEffect(effect => {
                        effect.name = "Slimy Mien"
                        effect.changes = [
                            {
                                key: "system.traits.ci.value",
                                value: "charmed",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.attributes.senses.blindsight",
                                value: 30,
                                mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE
                            }
                        ]
                        effect.flags = {
                            dae: {
                                enableCondition: "@flags.transformations.ooze.oozeForm == 1"
                            }
                        }
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Elastic Limbs`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.Zf3zqHvOkKTpO0Mb",
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
                    "Compendium.transformations.gh-transformations.Item.Zf3zqHvOkKTpO0Mb",
                    "Compendium.transformations.gh-transformations.Item.6Y1K0QKDjMZPyX8s"
                ]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.Zf3zqHvOkKTpO0Mb"]
                    item.itemName = "Elastic Limbs"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addEffect(effect => {
                        effect.name = "Elastic Limbs"
                        effect.changes.count = 2
                        effect.changes = [
                            {
                                key: "system.attributes.movement.climb",
                                value: "@attributes.movement.walk",
                                mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE
                            },
                            {
                                key: "flags.midi-qol.range.mwak",
                                value: "5",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.6Y1K0QKDjMZPyX8s"]
                    item.itemName = "Melted Appearance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addEffect(effect => {
                        effect.name = "Melted Appearance"
                        effect.statuses = ["blinded"]
                        effect.changes.count = 0
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 2 with Viscous Durability (${loopVars.label})`,
            loop: () => viscousDurabilityChoices,
            setup: async ({loopVars}) =>
            {
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Viscous Durability",
                        choice: loopVars
                    }
                ]
            },
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.vJ6yLWVYkFTVcBxl",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters, loopVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    Array.from(actor.system?.traits?.dr?.value ?? []).includes(loopVars.value) &&
                    Array.from(actor.system?.traits?.di?.value ?? []).includes("acid")
                )
            },
            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.vJ6yLWVYkFTVcBxl",
                    "Compendium.transformations.gh-transformations.Item.6Y1K0QKDjMZPyX8s"
                ]
                actorDto.stats.resistances = [loopVars.value]
                actorDto.stats.immunities = ["acid"]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.vJ6yLWVYkFTVcBxl"]
                    item.itemName = "Viscous Durability"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(configuration =>
                        {
                            configuration.choices = [
                                {
                                    count: 1,
                                    pool: [
                                        "dr:cold",
                                        "dr:fire",
                                        "dr:lightning"
                                    ]
                                }
                            ]
                        })
                    })
                    item.addEffect(effect => {
                        effect.name = "Viscous Durability"
                        effect.changes.count = 2
                        effect.changes = [
                            {
                                key: "system.traits.ci.value",
                                value: "frightened",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.traits.di.value",
                                value: "acid",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.6Y1K0QKDjMZPyX8s"]
                    item.itemName = "Melted Appearance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addEffect(effect => {
                        effect.name = "Melted Appearance"
                        effect.statuses = ["blinded"]
                        effect.changes.count = 0
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Corrosive Membrane`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.Zf3zqHvOkKTpO0Mb",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.4wBzd27wLWGJEhrc",
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
                    "Compendium.transformations.gh-transformations.Item.4wBzd27wLWGJEhrc",
                    "Compendium.transformations.gh-transformations.Item.0Mdkmo9YMceCgXqp"
                ]
                actorDto.stats.vulnerabilities = ["radiant"]
                actorDto.rollModes.disadvantage.push(
                    {
                        identifier: ABILITY.DEXTERITY,
                        type: ROLL_TYPE.ABILITY_CHECK
                    },
                    {
                        identifier: ABILITY.DEXTERITY,
                        type: ROLL_TYPE.SAVING_THROW
                    }
                )
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.4wBzd27wLWGJEhrc"]
                    item.itemName = "Corrosive Membrane"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 1
                    item.addActivity(activity => {
                        activity.name = "Acid Damage"
                        activity.activationType = "special"
                        activity.duration.units = "inst"
                        activity.duration.concentration = false
                        activity.range.units = "spec"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "1d6"
                            damagePart.bonus = "@flags.transformations.stage"
                            damagePart.damageTypes = ["acid"]
                            damagePart.scalingNumber = 1
                        })
                    })
                    item.addEffect(effect => {
                        effect.name = "Corrosive Membrane"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                value: "Compendium.transformations.gh-transformations.Item.g8zsZxpHFQ2W3RNg",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                            }
                        ]
                        effect.flags.match.push({
                            path: "dae",
                            expected: {
                                disableCondition: "@flags.tarnsformations.ooze.oozeForm != 1"
                            }
                        })
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.0Mdkmo9YMceCgXqp"]
                    item.itemName = "Physical Deterioration"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addEffect(effect => {
                        effect.name = "Physical Deterioration"
                        effect.changes.count = 3
                        effect.changes = [
                            {
                                key: "system.traits.dv.value",
                                value: "radiant",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.abilities.dex.check.roll.mode",
                                value: "-1",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.abilities.dex.save.roll.mode",
                                value: "-1",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            }
                        ]
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Engulf`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.WYCAz3AuTqko3Z8Q",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.Zf3zqHvOkKTpO0Mb",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.w6Hkdr61lzK706NY",
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
                    "Compendium.transformations.gh-transformations.Item.w6Hkdr61lzK706NY",
                    "Compendium.transformations.gh-transformations.Item.0Mdkmo9YMceCgXqp"
                ]
                actorDto.stats.vulnerabilities = ["radiant"]
                actorDto.rollModes.disadvantage.push(
                    {
                        identifier: ABILITY.DEXTERITY,
                        type: ROLL_TYPE.ABILITY_CHECK
                    },
                    {
                        identifier: ABILITY.DEXTERITY,
                        type: ROLL_TYPE.SAVING_THROW
                    }
                )
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.w6Hkdr61lzK706NY"]
                    item.itemName = "Engulf"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfActivities = 2
                    item.numberOfEffects = 1
                    item.addActivity(activity => {
                        activity.name = "Engulf"
                        activity.activationType = "action"
                        activity.saveAbility = ["str"]
                        activity.duration.units = "inst"
                        activity.duration.concentration = false
                        activity.range.units = "ft"
                        activity.range.value = "5"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.addEffect(effect => {
                            effect.name = "Engulfed"
                            effect.statuses = ["coverTotal", "suffocation"]
                            effect.changes.count = 0
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Engulfed Damage"
                        activity.activationType = "special"
                        activity.duration.units = "inst"
                        activity.duration.concentration = false
                        activity.range.units = "spec"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "4d6"
                            damagePart.damageTypes = ["acid"]
                            damagePart.scalingNumber = 1
                        })
                    })
                    item.addEffect(effect => {
                        effect.name = "Engulfed"
                        effect.statuses = ["coverTotal", "suffocation"]
                        effect.changes.count = 0
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.0Mdkmo9YMceCgXqp"]
                    item.itemName = "Physical Deterioration"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "ooze"
                    item.numberOfEffects = 1
                    item.addEffect(effect => {
                        effect.name = "Physical Deterioration"
                        effect.changes.count = 3
                        effect.changes = [
                            {
                                key: "system.traits.dv.value",
                                value: "radiant",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.abilities.dex.check.roll.mode",
                                value: "-1",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            },
                            {
                                key: "system.abilities.dex.save.roll.mode",
                                value: "-1",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD
                            }
                        ]
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: []
}
