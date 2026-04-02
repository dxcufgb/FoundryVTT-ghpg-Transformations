// test/definitions/hag.testdef.js
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";

function allowMockRollMessageUpdates(message)
{
    let latestRolls = null

    const getRelatedMessages = () =>
        [
            message,
            game.messages?.get(message?.id)
        ]
        .filter(Boolean)
        .filter((candidate, index, collection) =>
            collection.findIndex(entry => entry === candidate) === index
        )

    function applyRolls(rolls)
    {
        latestRolls = rolls

        for (const currentMessage of getRelatedMessages()) {
            Object.defineProperty(currentMessage, "rolls", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: rolls
            })
        }
    }

    function patchMessage(currentMessage)
    {
        if (!currentMessage || currentMessage.__mockRollsEnabled) {
            if (currentMessage && Array.isArray(latestRolls)) {
                applyRolls(latestRolls)
            }
            return
        }

        const originalUpdate = currentMessage.update.bind(currentMessage)

        Object.defineProperty(currentMessage, "__mockRollsEnabled", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: true
        })

        if (Array.isArray(latestRolls)) {
            applyRolls(latestRolls)
        }

        currentMessage.update = async function update(data = {}, ...args)
        {
            if (Array.isArray(data?.rolls)) {
                const {rolls, ...remaining} = data

                applyRolls(rolls)

                if (Object.keys(remaining).length === 0) {
                    return this
                }

                const result = await originalUpdate(remaining, ...args)
                applyRolls(rolls)
                patchMessage(game.messages?.get(message?.id))
                return result
            }

            const result = await originalUpdate(data, ...args)
            patchMessage(game.messages?.get(message?.id))
            return result
        }
    }

    for (const currentMessage of getRelatedMessages()) {
        patchMessage(currentMessage)
    }
}

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
            finalAssertions: async ({actor, assert, loopVars}) =>
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
            finalAssertions: async ({actor, assert}) =>
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
            finalAssertions: async ({actor, assert}) =>
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
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    loopVars.adept,
                    loopVars.spell,
                    "Compendium.transformations.gh-transformations.Item.ZzTR302lGjMOrQnx",
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X"
                ]
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
        },
        {
            name: `stage 3 with The Green Sisterhood with Summon Gasdra`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await helpers.hag.chooseTransformationChoiceByUuid({
                            waiters,
                            runtime,
                            actor,
                            stage: 3,
                            choiceUuid: "Compendium.transformations.gh-transformations.Item.sKoEV2o2qWnMSxMW"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.h9DWEfJyHqROMaf3",
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X",
                    "Compendium.transformations.gh-transformations.Item.Gqw92KcRDG2QvOYg",
                    "Compendium.transformations.gh-transformations.Item.Y7lbGMGK76JZzI8h",
                    "Compendium.transformations.gh-transformations.Item.sKoEV2o2qWnMSxMW"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Master of the Green Sisterhood"
                    item.addActivity(activity => {
                        activity.name = "Hag Spell Recovery"
                    })
                    item.addActivity(activity => {
                        activity.name = "Mimic"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Summon Gasdra"
                })
                actorDto.addItem(item => {
                    item.itemName = "Claw"
                    item.addActivity(activity => {
                        activity.name = "Midi Attack"
                        activity.activationType = "action"
                    })
                    item.addDamagePart("base", damagePart => {
                        damagePart.roll = "2d6"
                        damagePart.type = "slashing"
                        damagePart.bonus = "@mod"
                    })
                    item.range.reach = 5
                    item.range.units = "ft"
                })
                actorDto.addItem(item => {
                    item.itemName = "Purity’s Pain"
                    item.addActivity(activity => {
                        activity.name = "Purity induced Pain"
                        activity.addDamagePart(damagePart => {
                            damagePart.bonus = "@abilities.cha.mod"
                            damagePart.roll = "3d6"
                            damagePart.type = "psychic"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Fear of Purity"
                        activity.addConsumption(consumption => {
                            consumption.number = 1
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                        })
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.saveDc = 18
                        activity.saveAbiliy = "wis"
                        activity.addEffect(effect => {
                            effect.name = "Frightened"
                            effect.statuses = ["frightened"]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with The Green Sisterhood with Create Hag's Eye`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.x72rfx8vOfW4PCLZ",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await helpers.hag.chooseTransformationChoiceByUuid({
                            waiters,
                            runtime,
                            actor,
                            stage: 3,
                            choiceUuid: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.h9DWEfJyHqROMaf3",
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X",
                    "Compendium.transformations.gh-transformations.Item.Gqw92KcRDG2QvOYg",
                    "Compendium.transformations.gh-transformations.Item.Y7lbGMGK76JZzI8h",
                    "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Create Hag's Eye"
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with The Red Sisterhood`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.9uBHDM8XzGoUek8Y",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
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
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X",
                    "Compendium.transformations.gh-transformations.Item.Y7lbGMGK76JZzI8h",
                    "Compendium.transformations.gh-transformations.Item.TIKmev4FNvD6wfqU",
                    "Compendium.transformations.gh-transformations.Item.0QxkaaXnKKlzdAha"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Master of the Red Sisterhood"
                    item.addActivity(activity => {
                        activity.name = "Challenge Mental Influence"
                        activity.addConsumption(consumption => {
                            consumption.number = 1
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                        })
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.checkDc = 14 + 3
                        activity.checkAbiliy = "cha"
                    })
                    item.addActivity(activity => {
                        activity.name = "Hag Charm Person"
                        activity.activity = "bonus"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Claw"
                    item.addActivity(activity => {
                        activity.name = "Midi Attack"
                        activity.activationType = "action"
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "1d6"
                            damagePart.type = "slashing"
                            damagePart.bonus = "@mod"
                        })
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "1d4"
                            damagePart.type = "psychic"
                        })
                    })
                    item.addDamagePart("base", damagePart => {
                        damagePart.roll = "1d6"
                        damagePart.type = "slashing"
                        damagePart.bonus = "@mod"
                    })
                    item.range.reach = 5
                    item.range.units = "ft"
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with The Sea Sisterhood`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorWisdomModifier = actor.system.abilities.wis.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.6rVQqrBxeoqLBp3X",
                    "Compendium.transformations.gh-transformations.Item.Y7lbGMGK76JZzI8h",
                    "Compendium.transformations.gh-transformations.Item.Gqw92KcRDG2QvOYg"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Master of the Sea Sisterhood"
                    item.addActivity(activity => {
                        activity.name = "Frightening Gaze"
                        activity.activationType = "bonus"
                        activity.addConsumption(consumption => {
                            consumption.number = 1
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                        })
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.range.value = 30
                        activity.range.unit = "ft"
                        activity.saveDc = 14 + actorWisdomModifier
                        activity.saveAbiliy = "wis"
                        activity.addEffect(effect => {
                            effect.name = "Frightened"
                            effect.statuses = ["frightened"]
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Grant Water Breathing"
                        activity.activity = "action"
                        activity.range.unit = "touch"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.addEffect(effect => {
                            effect.name = "Water Breathing"
                            effect.description = "You can breathe under water for the number of minutes rolled on the hit die."
                        })
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Claw"
                    item.addActivity(activity => {
                        activity.name = "Midi Attack"
                        activity.activationType = "action"
                    })
                    item.addDamagePart("base", damagePart => {
                        damagePart.roll = "2d6"
                        damagePart.type = "slashing"
                        damagePart.bonus = "@mod"
                    })
                    item.range.reach = 5
                    item.range.units = "ft"
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Evil Eye`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Xjl2r8LyJwtM1v9B",
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorCharismaModifier = actor.system.abilities.cha.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.Xjl2r8LyJwtM1v9B",
                    "Compendium.transformations.gh-transformations.Item.6xN7rWi01hoqVLtv"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Evil Eye"
                    item.addActivity(activity => {
                        activity.name = "Bloody Gaze"
                        activity.activationType = "action"
                        activity.addConsumption(consumption => {
                            consumption.number = 1
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                        })
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.range.value = 30
                        activity.range.unit = "ft"
                        activity.saveDc = 14 + actorCharismaModifier
                        activity.saveAbiliy = "wis"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Arch-Crone’s Hunger"
                    item.addActivity(activity => {
                        activity.name = "Eat Normal Food"
                        activity.activationType = "special"
                        activity.saveDc = 18
                        activity.saveAbiliy = "con"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 4 with Grandmothers Curse and ${loopVars.shadowsteelCurseName}`,
            loop: () => [
                {
                    shadowsteelCurseName: "Curse of Uncontrollable Wrath",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.5RfQnEucJf3qTMPE"
                },
                {
                    shadowsteelCurseName: "Curse of Ravenous Hunger",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.osLCRe9zw7pSqwtP"
                },
                {
                    shadowsteelCurseName: "Curse of Lost Sentiment",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.ldvsuYNMihg5LNt5"
                },
                {
                    shadowsteelCurseName: "Curse of Insatiable Greed",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.pQY1AvkxOmUQAor3"
                },
                {
                    shadowsteelCurseName: "Curse of Ill-Fated Fortune",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.9bwXQS1GB23Xuy8e"
                },
                {
                    shadowsteelCurseName: "Curse of Foul Blight",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.Coqe6hVJWyzuUH4C"
                },
                {
                    shadowsteelCurseName: "Curse of Fastidious Pride",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.ZoFVuJg59gqu6gSM"
                },
                {
                    shadowsteelCurseName: "Curse of Damned Aging",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.CjXLAAbjedJIYyCU"
                },
                {
                    shadowsteelCurseName: "Curse of Crushing Sensation",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.jLTfPpvW44ig6wWI"
                },
                {
                    shadowsteelCurseName: "Curse of Conceited Obsession",
                    shadowsteelCurseUuid: "Compendium.transformations.gh-transformations.Item.0vvQkWQdeXgf3QLR"
                }
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G",
                    await: async ({runtime, actor, waiters, helpers}) =>
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
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.eG2vyH78glP3sdsV",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.hag.chooseTransformationChoiceByUuid({
                            waiters,
                            runtime,
                            actor,
                            stage: 4,
                            choiceUuid: loopVars.shadowsteelCurseUuid
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    loopVars.shadowsteelCurseUuid,
                    "Compendium.transformations.gh-transformations.Item.eG2vyH78glP3sdsV"
                ]
                actorDto.addItem(item =>
                {
                    item.itemName = "Grandmother’s Curse"
                })
                actorDto.addItem(item => {
                    item.itemName = loopVars.shadowsteelCurseName
                    item.type = "spell"
                    item.uses.max = 1
                    item.uses.value = 1
                    item.uses.spent = 0
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.prepared = 2
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
                async ({actor, runtime, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion
                    const hideousAppearance = actor.items.find(i => i.name === "Hideous Appearance")

                    if (!hideousAppearance) {
                        throw new Error("Hideous Appearance item not present on actor")
                    }

                    await runtime.services.triggerRuntime.run("rollSavingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: false,
                                item: {
                                    id: hideousAppearance.id,
                                    name: hideousAppearance.name,
                                    uuid: hideousAppearance.uuid,
                                    sourceUuid: hideousAppearance.flags.transformations.sourceUuid
                                },
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

            assertions: async ({actor, assert, staticVars}) =>
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
                async ({actor, runtime, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion
                    const hideousAppearance = actor.items.find(i => i.name === "Hideous Appearance")

                    if (!hideousAppearance) {
                        throw new Error("Hideous Appearance item not present on actor")
                    }

                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: false,
                                item: {
                                    id: hideousAppearance.id,
                                    name: hideousAppearance.name,
                                    uuid: hideousAppearance.uuid,
                                    sourceUuid: hideousAppearance.flags.transformations.sourceUuid
                                },
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

            assertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = staticVars.initialExhaustion + 1
                validate(actorDto, {assert})
            }
        },

        {
            name: `Create Hag's Eye adds a Hag's Eye item to the actor inventory`,

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
                    },
                    {
                        name: "Master of the Green Sisterhood",
                        choice: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, staticVars}) =>
                {
                    staticVars.initialHagsEyeCount = actor.items.filter(item =>
                        item.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.K5VdnECeAQMHonCF"
                    ).length

                    const createHagsEyeItem = actor.items.find(item =>
                        item.name === "Create Hag's Eye"
                    )

                    if (!createHagsEyeItem) {
                        throw new Error("Create Hag's Eye item not present on actor")
                    }

                    const activity = createHagsEyeItem.system.activities.find(activity =>
                        activity.name === "Midi Use"
                    )

                    if (!activity) {
                        throw new Error("Create Hag's Eye activity not present on item")
                    }

                    await activity.use({actor})
                }
            ],

            await: async ({runtime, waiters, actor, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.items.filter(item =>
                        item.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.K5VdnECeAQMHonCF"
                    ).length === staticVars.initialHagsEyeCount + 1
                )
            },

            assertions: async ({actor, assert, expect, staticVars}) =>
            {
                const hagsEyes = actor.items.filter(item =>
                    item.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.K5VdnECeAQMHonCF"
                )

                expect(
                    hagsEyes.length,
                    "Create Hag's Eye should add one Hag's Eye to the actor inventory"
                ).to.equal(staticVars.initialHagsEyeCount + 1)
                expect(
                    hagsEyes.at(-1),
                    "Created Hag's Eye item should exist on the actor"
                ).to.exist

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.K5VdnECeAQMHonCF"
                ]
                validate(actorDto, {assert})
            }
        },

        {
            name: `Hag Spell Recovery opens its dialog and restores an eligible spell slot`,

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
                    },
                    {
                        name: "Master of the Green Sisterhood",
                        choice: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, helpers, staticVars}) =>
                {
                    const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                    const classItem = await helpers.createActorItemAndWait(
                        actor,
                        foundCharacterClass,
                        {
                            setTransformationFlags: false,
                            setDdbImporterFlag: false,
                            applyAdvancements: false,
                            levels: 6
                        }
                    )

                    await classItem.update({
                        "system.hd.value": 3,
                        "system.hd.max": 6,
                        "system.hd.spent": 3
                    })

                    staticVars.classItemId = classItem.id

                    await actor.update({
                        "system.spells.spell1.override": 2,
                        "system.spells.spell1.value": 1,
                        "system.spells.spell2.override": 1,
                        "system.spells.spell2.value": 0,
                        "system.spells.spell3.override": 1,
                        "system.spells.spell3.value": 0,
                        "system.spells.pact.max": 0,
                        "system.spells.pact.value": 0,
                        "system.spells.pact.level": 0
                    })

                    staticVars.initialSpell1Value = actor.system.spells.spell1.value
                    staticVars.initialSpell2Value = actor.system.spells.spell2.value
                    staticVars.initialSpell3Value = actor.system.spells.spell3.value
                    staticVars.initialHitDiceValue =
                        actor.items.get(classItem.id)?.system?.hd?.value

                    const masterOfTheGreenSisterhood = actor.items.find(item =>
                        item.name === "Master of the Green Sisterhood"
                    )

                    if (!masterOfTheGreenSisterhood) {
                        throw new Error("Master of the Green Sisterhood item not present on actor")
                    }

                    const activity = masterOfTheGreenSisterhood.system.activities.find(activity =>
                        activity.name === "Hag Spell Recovery"
                    )

                    if (!activity) {
                        throw new Error("Hag Spell Recovery activity not present on item")
                    }

                    await activity.use({actor})
                }
            ],

            await: async ({runtime, waiters, staticVars, actor}) =>
            {
                await waiters.waitForCondition(() =>
                    document.querySelector(".hag-spell-recovery") != null
                )

                const dialog = document.querySelector(".hag-spell-recovery")

                if (!dialog) {
                    throw new Error("Hag Spell Recovery dialog did not open")
                }

                staticVars.dialog = dialog

                const levelLabels = Array.from(
                    dialog.querySelectorAll(".hag-spell-recovery__level")
                ).map(element => element.textContent.trim())

                if (!levelLabels.includes("2")) {
                    throw new Error("Expected level 2 spell slot options in Hag Spell Recovery dialog")
                }

                const level2Group = Array.from(
                    dialog.querySelectorAll(".hag-spell-recovery__group")
                ).find(group =>
                    group.querySelector(".hag-spell-recovery__level")
                    ?.textContent?.trim() === "2"
                )

                if (!level2Group) {
                    throw new Error("Level 2 spell slot group not found in Hag Spell Recovery dialog")
                }

                const level2Radio = level2Group.querySelector("[data-slot-radio]")
                if (!level2Radio) {
                    throw new Error("No selectable spell slot found in level 2 group")
                }

                level2Radio.checked = true
                level2Radio.dispatchEvent(new Event("change", {bubbles: true}))
                await waiters.waitForNextFrame()

                const confirmButton =
                          dialog.querySelector("[data-action='confirm']")

                if (!confirmButton) {
                    throw new Error("Hag Spell Recovery confirm button not found")
                }

                confirmButton.click()
                await waiters.waitForNextFrame()

                await waiters.waitForCondition(() =>
                    document.querySelector(".hag-spell-recovery") == null
                )
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, expect, waiters, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.spells.spell2.value === staticVars.initialSpell2Value + 1 &&
                    actor.items.get(staticVars.classItemId)?.system?.hd?.value ===
                    staticVars.initialHitDiceValue - 2
                )

                expect(actor.system.spells.spell1.value).to.equal(staticVars.initialSpell1Value)
                expect(actor.system.spells.spell2.value).to.equal(staticVars.initialSpell2Value + 1)
                expect(actor.system.spells.spell3.value).to.equal(staticVars.initialSpell3Value)
                expect(
                    actor.items.get(staticVars.classItemId)?.system?.hd?.value
                ).to.equal(staticVars.initialHitDiceValue - 2)
                expect(
                    document.querySelector(".hag-spell-recovery") != null
                ).to.equal(false)
            }
        },

        {
            name: `Grant Water Breathing rolls a hit die, removes the button, and keeps the roll visible`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "hag": {
                            1: "Compendium.transformations.gh-transformations.Item.uvXqAIXFpzl5Gb9G"
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
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, helpers, waiters, staticVars}) =>
                {
                    const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                    const classItem = await helpers.createActorItemAndWait(
                        actor,
                        foundCharacterClass,
                        {
                            setTransformationFlags: false,
                            setDdbImporterFlag: false,
                            applyAdvancements: false,
                            levels: 4
                        }
                    )

                    await classItem.update({
                        "system.hd.value": 2,
                        "system.hd.max": 4,
                        "system.hd.spent": 2
                    })

                    staticVars.classItemId = classItem.id
                    staticVars.initialHitDiceValue =
                        actor.items.get(classItem.id)?.system?.hd?.value
                    staticVars.initialMessageCount = game.messages.contents.length

                    const masterOfTheSeaSisterhood = actor.items.find(item =>
                        item.name === "Master of the Sea Sisterhood"
                    )

                    if (!masterOfTheSeaSisterhood) {
                        throw new Error("Master of the Sea Sisterhood item not present on actor")
                    }

                    const activity = masterOfTheSeaSisterhood.system.activities.find(activity =>
                        activity.name === "Grant Water Breathing"
                    )

                    if (!activity) {
                        throw new Error("Grant Water Breathing activity not present on item")
                    }

                    const activityUseResult = await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message =
                        game.messages.get(
                            activityUseResult?.message?.id ??
                            activityUseResult?.chatMessage?.id ??
                            activityUseResult?.changes?.message?.id ??
                            ""
                        ) ??
                        game.messages.contents.at(-1)

                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Duration"
                })
            },

            assertions: async ({actor, expect, helpers, waiters, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    allowMockRollMessageUpdates(staticVars.message)

                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card).to.exist
                    expect(card.dataset.hagActivity).to.equal("grantWaterBreathing")
                    expect(message.flags?.transformations?.hagActivity).to.equal("grantWaterBreathing")
                    expect(message.flags?.transformations?.state).to.equal("initial")
                    expect(message.flags?.transformations?.hitDie).to.equal("d6")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Duration"
                    }, expect)

                    rollHelper.queueRoll({
                        formula: "d6",
                        total: 4,
                        diceResults: [4]
                    })

                    await waiters.waitForCondition(() =>
                        chatCardHelper.getLiveRoot()
                        ?.querySelector?.("[data-transformations-action='rollDuration']") != null
                    )

                    const liveRollButton = chatCardHelper.getLiveRoot()
                    .querySelector("[data-transformations-action='rollDuration']")

                    if (!liveRollButton) {
                        throw new Error("Live Grant Water Breathing roll button not found")
                    }

                    liveRollButton.click()
                    await waiters.waitForNextFrame()

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "d6"
                        )
                    )

                    await waiters.waitForCondition(() =>
                        actor.items.get(staticVars.classItemId)?.system?.hd?.value ===
                        staticVars.initialHitDiceValue - 1
                    )

                    const presentedRolls =
                              await chatCardHelper.waitForPresentedRolls({count: 1})

                    await waiters.waitForCondition(() =>
                        chatCardHelper.getCardElement()?.dataset?.state === "rolled"
                    )

                    const rolledCard = chatCardHelper.getCardElement({require: true})
                    const currentMessage = chatCardHelper.getMessage()

                    expect(presentedRolls[0]?.formula).to.equal("1d6")
                    expect(presentedRolls[0]?.total).to.equal(4)
                    expect(rolledCard.dataset.state).to.equal("rolled")
                    expect(chatCardHelper.hasButton({
                        text: "Roll Duration"
                    })).to.equal(false)

                    await currentMessage.update({
                        "flags.transformations.grantWaterBreathingPersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(4)
                    expect(
                        actor.items.get(staticVars.classItemId)?.system?.hd?.value
                    ).to.equal(staticVars.initialHitDiceValue - 1)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Arch-crone's Hunger Eat Normal Food constitution saving throw success does not add exhaustion`,

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
                    },
                    {
                        name: "Master of the Green Sisterhood",
                        choice: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Xjl2r8LyJwtM1v9B"
                }
            ],

            steps: [
                async ({actor, runtime, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion

                    const archCronesHunger = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.6xN7rWi01hoqVLtv"
                    )

                    if (!archCronesHunger) {
                        throw new Error("Arch-crone's Hunger item not present on actor")
                    }

                    const activity = archCronesHunger.system.activities.find(activity =>
                        activity.name === "Eat Normal Food"
                    )

                    if (!activity) {
                        throw new Error("Eat Normal Food activity not present on Arch-crone's Hunger")
                    }

                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "con",
                                isSpell: false,
                                item: {
                                    id: archCronesHunger.id,
                                    name: archCronesHunger.name,
                                    uuid: archCronesHunger.uuid,
                                    sourceUuid: archCronesHunger.flags.transformations.sourceUuid
                                },
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

            assertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = staticVars.initialExhaustion
                validate(actorDto, {assert})
            }
        },

        {
            name: `Arch-crone's Hunger Eat Normal Food constitution saving throw failure adds exhaustion`,

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
                    },
                    {
                        name: "Master of the Green Sisterhood",
                        choice: "Compendium.transformations.gh-transformations.Item.MPBBGWM5q6YwOZHU"
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Xjl2r8LyJwtM1v9B"
                }
            ],

            steps: [
                async ({actor, runtime, staticVars}) =>
                {
                    staticVars.initialExhaustion = actor.system.attributes.exhaustion

                    const archCronesHunger = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.6xN7rWi01hoqVLtv"
                    )

                    if (!archCronesHunger) {
                        throw new Error("Arch-crone's Hunger item not present on actor")
                    }

                    const activity = archCronesHunger.system.activities.find(activity =>
                        activity.name === "Eat Normal Food"
                    )

                    if (!activity) {
                        throw new Error("Eat Normal Food activity not present on Arch-crone's Hunger")
                    }

                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "con",
                                isSpell: false,
                                item: {
                                    id: archCronesHunger.id,
                                    name: archCronesHunger.name,
                                    uuid: archCronesHunger.uuid,
                                    sourceUuid: archCronesHunger.flags.transformations.sourceUuid
                                },
                                naturalRoll: 17,
                                total: 17,
                                success: false
                            }
                        }
                    })
                }
            ],

            await: async ({runtime, waiters, actor, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.system.attributes.exhaustion ===
                    staticVars.initialExhaustion + 1
                )
            },

            assertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = staticVars.initialExhaustion + 1
                validate(actorDto, {assert})
            }
        }
    ]
}
