import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";

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
                const actorProf = actor.system.attributes.prof
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
        }
    ],
    itemBehaviorTests: []
}
