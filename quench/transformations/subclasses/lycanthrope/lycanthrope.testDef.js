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
            loop: () => [
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
                            }
                        ]
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
                            }
                        ]
                    }
                }
            ],

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
                        activity.duration.unit = "hour"
                        activity.settings.effects = ["all"]
                        activity.settings.keep = ["self"]
                        activity.settings.merge = ["saves", "skills"]
                        activity.transformationChoices = [loopVars.formUuid]
                    })
                    item.addActivity(activity => {
                        activity.name = loopVars.effectActivityName
                        activity.activationType = ""
                        activity.duration.value = 1
                        activity.duration.unit = "hour"
                        activity.addEffect(effect => {
                            effect.name = loopVars.effect.name
                            effect.changes = loopVars.effect.changes
                        })
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
        }
    ]
}
