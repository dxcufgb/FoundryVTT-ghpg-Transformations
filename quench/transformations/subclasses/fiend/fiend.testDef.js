import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

export const fiendTestDef = {
    id: "fiend",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) => `stage 1 with Devilish Contractor and ${loopVars.damageType} resistance`,
            loop: () => [
                {damageType: "acid"},
                {damageType: "cold"},
                {damageType: "fire"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.damageType
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Fiend"
                })
                actorDto.addItem(item => {
                    item.itemName = "Devilish Contractor"
                    item.addActivity(activity => {
                        activity.name = "Devilish Contractor"
                        activity.activationType = "action"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Fiend Bound"
                    item.addEffect(effect => {
                        effect.name = "Fiend Bound"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.death.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Fiendish Soul"
                    item.addEffect(effect => {
                        effect.name = "Fiendish Deception"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.skills.dec.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                    })
                })
                actorDto.stats.resistances.push(loopVars.damageType)
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 1 with Infernal Smite and ${loopVars.damageType} resistance`,
            loop: () => [
                {damageType: "acid"},
                {damageType: "cold"},
                {damageType: "fire"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.damageType
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Fiend"
                })
                actorDto.addItem(item => {
                    item.itemName = "Fiend Bound"
                    item.addEffect(effect => {
                        effect.name = "Fiend Bound"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.death.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Fiendish Soul"
                    item.addEffect(effect => {
                        effect.name = "Fiendish Deception"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.skills.dec.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Infernal Smite"
                    item.uses.max = actorProf + 1
                    item.uses.value = actorProf + 1
                    item.usesLeft = actorProf + 1
                    item.uses.recovery.period = "lr"
                    item.uses.recovery.type = "recoverAll"
                    item.addActivity(activity => {
                        activity.name = "Midi Damage"
                        activity.activityType = "special"
                        activity.consumption.addTarget(target => {
                            target.type = "itemUses"
                            target.value = 1
                        })
                        activity.range.units = "spec"
                        activity.addDamagePart(damagePart => {
                            damagePart.custom = "(@flags.transformations.stage)d6"
                            damagePart.numbberOfTypes = 1
                            damagePart.type = loopVars.damageType
                        })
                    })
                })
                actorDto.stats.resistances.push(loopVars.damageType)
                validate(actorDto, {assert})
            }
        }
    ],

    itemBehaviorTests: [
        // {
        //     name: (vars) => `Gift of Joyous Life`,
        //
        //     setup: async ({actor}) =>
        //     {
        //         await actor.update({
        //             "flags.transformations.stageChoices": {
        //                 "fiend": {
        //                     1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
        //                 }
        //             }
        //         })
        //     },
        //
        //     requiredPath: [
        //         {
        //             stage: 1
        //         }
        //     ],
        //
        //     steps: [
        //         async ({actor, runtime, helpers, waiters, loopVars}) =>
        //         {
        //             await helpers.fiend.chooseDamageResistanceOnStage1({
        //                 waiters,
        //                 runtime,
        //                 actor,
        //                 choice: loopVars.damageType
        //             })
        //         }
        //     ],
        //
        //     await: async ({
        //         waiters,
        //         actor
        //     }) =>
        //     {
        //         await waiters.waitForCondition(() =>
        //             actor.system.traits.dr.value.has("cold")
        //         )
        //     },
        //
        //     assertions: async ({actor, assert, validators}) =>
        //     {
        //         const actorDto = new ActorValidationDTO(actor)
        //         actorDto.stats.resistances = ["cold"]
        //         actorDto.effects.has.push("Fey Form Resistance")
        //         validate(actorDto, {assert})
        //     }
        // }

    ]
}