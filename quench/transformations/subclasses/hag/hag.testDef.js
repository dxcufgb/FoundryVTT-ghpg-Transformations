// test/definitions/hag.testdef.js
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";

export const HagTestDef = {
    id: "hag",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) => `stage 1 with The Green Sisterhood and ${loopVars.saveProficiency} proficiency`,
            loop: () => [
                {saveProficiency: "str"},
                {saveProficiency: "int"},
                {saveProficiency: "cha"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.hag.chooseSaveProficiencyOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.saveProficiency
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorCharismaModifier = actor.system.abilities.cha.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.voZkMwLxwSvVml4p",
                    "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU",
                    "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Fey"
                })
                actorDto.addItem(item => {
                    item.itemName = "Hag Form"
                    item.addEffect(effect => {
                        effect.name = "Hag Form"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.ac.armor",
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: 13
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Hideous Appearance"
                    item.addEffect(effect => {
                        effect.name = "Hideous Appearance"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.skills.per.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            }
                        ]
                    })
                    item.addActivity(activity => {
                        activity.name = "Look at Reflection"
                        activity.activationType = "action"
                        activity.addConsumptionTarget(consumptionTarget => {
                            consumptionTarget.type = "activity"
                            consumptionTarget.value = 1
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.saveDc = 18
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "The Green Sisterhood"
                    item.addEffect(effect => {
                        effect.name = "The Green Sisterhood"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.senses.darkvision",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 60
                            }
                        ]
                    })
                    item.addActivity(activity => {
                        activity.name = "Mimic"
                        activity.activationType = "action"
                        activity.checkAssociated = ["ins"]
                        activity.checkDc = 8 + 1 + actorCharismaModifier
                    })
                })
                actorDto.abilities[loopVars.saveProficiency].proficient = 1
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 1 with The Red Sisterhood and ${loopVars.saveProficiency} proficiency`,
            loop: () => [
                {saveProficiency: "str"},
                {saveProficiency: "int"},
                {saveProficiency: "cha"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.9uBHDM8XzGoUek8Y",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.hag.chooseSaveProficiencyOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.saveProficiency
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.voZkMwLxwSvVml4p",
                    "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU",
                    "Compendium.transformations.gh-transformations.Item.9uBHDM8XzGoUek8Y"
                ]
                actorDto.addItem(item => {
                    item.itemName = "The Red Sisterhood"
                    item.addEffect(effect => {
                        effect.name = "The Red Sisterhood"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.senses.darkvision",
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: 60
                            }
                        ]
                    })
                })
                actorDto.skills.per.proficient = 1
                actorDto.skills.dec.proficient = 1
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 1 with The Sea Sisterhood and ${loopVars.saveProficiency} proficiency`,
            loop: () => [
                {saveProficiency: "str"},
                {saveProficiency: "int"},
                {saveProficiency: "cha"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.hag.chooseSaveProficiencyOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.saveProficiency
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorWisdomModifier = actor.system.abilities.wis.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.voZkMwLxwSvVml4p",
                    "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU",
                    "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G"
                ]
                actorDto.addItem(item => {
                    item.itemName = "The Sea Sisterhood"
                    item.addEffect(effect => {
                        effect.name = "The Sea Sisterhood"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.movement.swim",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 10
                            },
                            {
                                key: "system.attributes.senses.darkvision",
                                mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                                value: 60
                            }
                        ]
                    })
                    item.addActivity(activity => {
                        activity.name = "Gaze"
                        activity.activationType = "action"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.range.value = 30
                        activity.range.unit = "ft"
                        activity.saveDc = 8 + 1 + actorWisdomModifier
                        activity.addDamagePart(damagePart => {
                            damagePart.custom = "(@flags.transformations.stage)d8"
                            damagePart.type = "psychic"
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 2 with ${loopVars.sisterhood}`,
            loop: () => [
                {
                    sisterhood: "The Green Sisterhood",
                    sisterhoodUuid: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ",
                    adept: "Compendium.transformations.gh-transformations.Item.7aZ5kLXScwDDwX7E",
                    spell: "Compendium.transformations.gh-transformations.Item.kkfFADuQHxFgxeaP",
                    spellData: {
                        name: "Invisibility (Adept of the Green Sisterhood)"
                    }
                },
                {
                    sisterhood: "The Red Sisterhood",
                    sisterhoodUuid: "Compendium.transformations.gh-transformations.Item.9uBHDM8XzGoUek8Y",
                    adept: "Compendium.transformations.gh-transformations.Item.zOGFmHYkrM4ZKbEU",
                    spell: "Compendium.transformations.gh-transformations.Item.PplpAQyFEx9XTHiE",
                    spellData: {
                        name: "Charm Person (Adept of the Red Sisterhood)"
                    }
                },
                {
                    sisterhood: "The Sea Sisterhood",
                    sisterhoodUuid: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G",
                    adept: "Compendium.transformations.gh-transformations.Item.uvW6tQLGDIGoCLtu",
                    spell: "Compendium.transformations.gh-transformations.Item.OhHNB8vk37DW2Dom",
                    spellData: {
                        name: "Disguise Self (Adept of the Sea Sisterhood)"
                    }
                }
            ],
            steps: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.sisterhoodUuid,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.hag.chooseSaveProficiencyOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "str"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    loopVars.sisterhoodUuid,
                    loopVars.adept,
                    loopVars.spell,
                    "Compendium.transformations.gh-transformations.Item.ZzTR302lGjMOrQnx",
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = loopVars.sisterhood
                })
                actorDto.addItem(item => {
                    item.itemName = "Claw"
                    item.addActivity(activity => {
                        activity.name = "Midi Attack"
                        activity.activationType = "action"
                    })
                    item.addDamagePart("base", damagePart => {
                        damagePart.roll = "1d6"
                        damagePart.type = "slashing"
                        damagePart.bonus = "@mod"
                    })
                    item.range.reach = 5
                    item.range.units = "ft"
                })
                actorDto.addItem(item => {
                    item.itemName = loopVars.spellData.name
                })
                actorDto.addItem(item => {
                    item.itemName = "Iron Sensitivity"
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
                        activity.name = "Midi Save"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = 1
                            })
                        })
                        activity.saveDc = 15
                        activity.addEffect(effect => {
                            effect.name = "Stunned"
                            effect.statuses = ["stunned"]
                            effect.duration.turns = 1
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: [
        {
            name: `Hideous Appearance saving throw success`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "hag": {
                            1: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Hag Form",
                        choice: {
                            id: "str",
                            label: "Strength",
                            icon: "modules/transformations/icons/abilities/Strength.svg",
                            raw: "saves:str",
                            value: "str"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion
                    const sourceHideousAppearance = await fromUuid(actor.items.find(i => i.name == "Hideous Appearance").flags.transformations.sourceUuid)
                    await runtime.services.triggerRuntime.run("rollSavingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: false,
                                item: sourceHideousAppearance,
                                naturalRoll: 18,
                                total: 18,
                                success: true
                            }
                        }
                    })
                }
            ],

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = staticVars.initialExhaustion
                validate(actorDto, {assert})
            }
        },

        {
            name: `Hideous Appearance saving throw success`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "hag": {
                            1: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Hag Form",
                        choice: {
                            id: "str",
                            label: "Strength",
                            icon: "modules/transformations/icons/abilities/Strength.svg",
                            raw: "saves:str",
                            value: "str"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion
                    const sourceHideousAppearance = await fromUuid(actor.items.find(i => i.name == "Hideous Appearance").flags.transformations.sourceUuid)
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: false,
                                item: sourceHideousAppearance,
                                naturalRoll: 17,
                                total: 17,
                                success: false
                            }
                        }
                    })
                }
            ],

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = staticVars.initialExhaustion + 1
                validate(actorDto, {assert})
            }
        }
    ]
}