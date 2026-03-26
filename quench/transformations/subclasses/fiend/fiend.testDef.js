import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { EffectValidationDTO } from "../../../helpers/validationDTOs/effect/EffectValidationDTO.js"
import { giftsOfDamnation } from "../../../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js";
import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog, getTransformationGeneralChoiceDialogWindowTitle } from "../../../selectors/transformationGeneralChoiceDialog.finders.js"
import { SKILL } from "../../../../config/constants.js";

function allowMockRollMessageUpdates(message)
{
    if (!message || message.__mockRollsEnabled) {
        return
    }

    const originalUpdate = message.update.bind(message)

    Object.defineProperty(message, "__mockRollsEnabled", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: true
    })

    message.update = async function update(data = {}, ...args)
    {
        if (Array.isArray(data?.rolls)) {
            Object.defineProperty(this, "rolls", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: data.rolls
            })

            const {rolls, ...remaining} = data

            if (Object.keys(remaining).length === 0) {
                return this
            }

            return originalUpdate(remaining, ...args)
        }

        return originalUpdate(data, ...args)
    }
}

function setFiendStage1DamageResistanceChoice()
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: "Fiendish Soul",
            choice: {
                icon: "modules/transformations/icons/damageTypes/Acid.png",
                id: "acid",
                label: "Acid",
                raw: "dr:acid",
                value: "acid"
            }
        }
    ]
}

async function applyHidingFiendAppearance({
    actor,
    helpers
})
{
    await helpers.applyItemActivityEffect({
        actor,
        itemName: "Fiend Form",
        effectName: "Hiding Fiend Appearance",
        macroTrigger: "on"
    })
}

async function applyGiftOfUnfetteredGloryAndTriggerHitDie({
    actor,
    runtime,
    waiters,
    staticVars
})
{
    staticVars.context = {
        rolls: [
            {
                parts: [
                    "1d8"
                ]
            }
        ]
    }

    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnfetteredGlory")
    await runtime.services.applyFiendGiftOfDamnation({
        actor,
        gift
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
    await waiters.waitForCondition(() =>
        actor.items.some(i => i.name === "Gift of Unfettered Glory")
    )

    await actor.update({
        "system.attributes.hp.value": 1
    })

    const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
    transformation.TransformationClass.onPreRollHitDie(staticVars.context, actor)
}

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
                actorDto.addItem(item => {
                    item.itemName = "Infernal Smite"
                    item.uses.max = actorProf + 1
                    item.uses.value = actorProf + 1
                    item.usesLeft = actorProf + 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
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
        },
        {
            name: `stage 2 with Enhanced Contract`,
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
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
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
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.uses.max = 1
                    item.uses.value = 1
                    item.usesLeft = 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.period = "sr"
                        recovery.type = "recoverAll"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Daemonic Brand as choice`,
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
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
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
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Daemonic Brand"
                    item.uses.max = actorProf
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "lr"
                    })
                    item.addActivity(activity => {
                        activity.name = "Midi Save"
                        activity.activationType = "bonus"
                        activity.duration.value = 1
                        activity.duration.units = "minute"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = 1
                            })
                        })
                        activity.range.value = 60
                        activity.range.unit = "ft"
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.saveAbility = ["wis"]
                        activity.saveDc = (8 + actorProf + 2)
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Saving Throw Penalty"
                            effect.description = "The creature takes a –2 penalty on all saving throws."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 6
                            effect.changes = [
                                {
                                    key: "system.abillities.cha.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.con.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.dex.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.int.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.str.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.wis.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                }
                            ]
                        })
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Attack Vulnerability"
                            effect.description = "The first attack against the creature on each turn is made with Advantage."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                        })
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Damaged Vitality"
                            effect.description = "The creature cannot regain Hit Points."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Daemonic Brand as default choice`,
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
                            choice: "acid"
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
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL"
                ]
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Devilish subcontractor`,
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
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                    "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Devilish Subcontractor"
                })
                actorDto.addItem(item => {
                    item.itemName = "Pull of the Netherworld"
                    item.uses.max = 1
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "lr"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "sr"
                    })
                    item.addActivity(activity => {
                        activity.name = "Midi Damage"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = 1
                            })
                        })
                    })
                })
                actorDto.stats.resistances.push("acid")
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Overwhelming Brand as choice`,
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
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
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
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW",
                    "Compendium.transformations.gh-transformations.Item.0npAmRAQjFWFpL6x"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Overwhelming Brand"
                    item.addActivity(activity => {
                        activity.name = "Halting Brand"
                        activity.activationType = ""
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.addEffect(effect => {
                            effect.name = "Halting Brand"
                            effect.description = "Your speed is halved. The fiend who branded you may move you 10 feet horizontally on their turn without using an action."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 0
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Blinding Brand"
                        activity.activationType = ""
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.addEffect(effect => {
                            effect.name = "Blinding Brand"
                            effect.description = "You are blinded."
                            effect.statuses = ["blinded"]
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 0
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],

    itemBehaviorTests: [
        {
            name: `Gift of Joyous Life, save Success`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Joyous Life")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Joyous Life")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Joyous Life chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfJoyousLife")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Hit Die"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 2
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(2)

                    await chatCardHelper.waitForButton({
                        text: "Apply Healing"
                    })

                    chatCardHelper.assertButtonExists({
                        text: "Apply Healing"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply Healing"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === staticVars.initialHp + 2
                    )

                    expect(actor.system.attributes.hp.value).to.equal(staticVars.initialHp + 2)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Joyous Life, save fail`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Joyous Life")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Joyous Life")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Joyous Life chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfJoyousLife")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Hit Die"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 1
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(1)

                    await chatCardHelper.waitForButton({
                        text: "Apply Damage"
                    })

                    chatCardHelper.assertButtonExists({
                        text: "Apply Damage"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply Damage"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === staticVars.initialHp - 1
                    )

                    expect(actor.system.attributes.hp.value).to.equal(staticVars.initialHp - 1)
                } finally {
                    rollHelper.restore()
                }
            }
        },
        {
            name: (vars) => `Gift of Prodigiuos Talent with ${vars.names[0]} and ${vars.names[1]} roll 2 on skill check`,

            loop: () => [
                {
                    skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                    names: ["Acrobatics", "Arcana"],
                    icons: ["Acrobatics", "Arcana"]
                },
                {
                    skills: [SKILL.ANIMAL_HANDLING, SKILL.ATHLETICS],
                    names: ["Animal Handling", "Athletics"],
                    icons: ["AnimalHandling", "Athletics"]
                },
                {
                    skills: [SKILL.DECEPTION, SKILL.HISTORY],
                    names: ["Deception", "History"],
                    icons: ["Deception", "History"]
                },
                {
                    skills: [SKILL.INSIGHT, SKILL.INTIMIDATION],
                    names: ["Insight", "Intimidation"],
                    icons: ["Insight", "Intimidation"]
                },
                {
                    skills: [SKILL.INVESTIGATION, SKILL.MEDICINE],
                    names: ["Investigation", "Medicine"],
                    icons: ["Investigation", "Medicine"]
                },
                {
                    skills: [SKILL.NATURE, SKILL.PERCEPTION],
                    names: ["Nature", "Perception"],
                    icons: ["Nature", "Perception"]
                },
                {
                    skills: [SKILL.PERFORMANCE, SKILL.PERSUASION],
                    names: ["Performance", "Persuasion"],
                    icons: ["Performance", "Persuasion"]
                },
                {
                    skills: [SKILL.RELIGION, SKILL.SLEIGHT_OF_HAND],
                    names: ["Religion", "Sleight of Hand"],
                    icons: ["Religion", "SleightOfHand"]
                },
                {
                    skills: [SKILL.STEALTH, SKILL.SURVIVAL],
                    names: ["Stealth", "Survival"],
                    icons: ["Stealth", "Survival"]
                }
            ],
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: loopVars.skills[0],
                                label: loopVars.names[0],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[0]}.png`,
                                raw: `skills:${loopVars.skills[0]}`,
                                value: loopVars.skills[0],
                                mode: "forcedExpertise"
                            },
                            {
                                id: loopVars.skills[1],
                                label: loopVars.names[1],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[1]}.png`,
                                raw: `skills:${loopVars.skills[1]}`,
                                value: loopVars.skills[1],
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: loopVars.skills[0],
                                naturalRoll: 2,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 2
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [loopVars.skills[0], loopVars.skills[1]],
                        longRestsLeftUntilFullHitDieRestoration: 2
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 0
                validate(actorDto, {assert})
            }
        },

        {
            name: (vars) => `Gift of Prodigiuos Talent with ${vars.names[0]} and ${vars.names[1]} roll 3 on skill check`,

            loop: () => [
                {
                    skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                    names: ["Acrobatics", "Arcana"],
                    icons: ["Acrobatics", "Arcana"]
                },
                {
                    skills: [SKILL.ANIMAL_HANDLING, SKILL.ATHLETICS],
                    names: ["Animal Handling", "Athletics"],
                    icons: ["AnimalHandling", "Athletics"]
                },
                {
                    skills: [SKILL.DECEPTION, SKILL.HISTORY],
                    names: ["Deception", "History"],
                    icons: ["Deception", "History"]
                },
                {
                    skills: [SKILL.INSIGHT, SKILL.INTIMIDATION],
                    names: ["Insight", "Intimidation"],
                    icons: ["Insight", "Intimidation"]
                },
                {
                    skills: [SKILL.INVESTIGATION, SKILL.MEDICINE],
                    names: ["Investigation", "Medicine"],
                    icons: ["Investigation", "Medicine"]
                },
                {
                    skills: [SKILL.NATURE, SKILL.PERCEPTION],
                    names: ["Nature", "Perception"],
                    icons: ["Nature", "Perception"]
                },
                {
                    skills: [SKILL.PERFORMANCE, SKILL.PERSUASION],
                    names: ["Performance", "Persuasion"],
                    icons: ["Performance", "Persuasion"]
                },
                {
                    skills: [SKILL.RELIGION, SKILL.SLEIGHT_OF_HAND],
                    names: ["Religion", "Sleight of Hand"],
                    icons: ["Religion", "SleightOfHand"]
                },
                {
                    skills: [SKILL.STEALTH, SKILL.SURVIVAL],
                    names: ["Stealth", "Survival"],
                    icons: ["Stealth", "Survival"]
                }
            ],
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: loopVars.skills[0],
                                label: loopVars.names[0],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[0]}.png`,
                                raw: `skills:${loopVars.skills[0]}`,
                                value: loopVars.skills[0],
                                mode: "forcedExpertise"
                            },
                            {
                                id: loopVars.skills[1],
                                label: loopVars.names[1],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[1]}.png`,
                                raw: `skills:${loopVars.skills[1]}`,
                                value: loopVars.skills[1],
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: loopVars.skills[0],
                                naturalRoll: 3,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 0
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [loopVars.skills[0], loopVars.skills[1]],
                        longRestsLeftUntilFullHitDieRestoration: 0
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 1
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Prodigiuos Talent long rest subtracts one from longRestsLeftUntilFullHitDieRestoration`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: SKILL.ACROBATICS,
                                label: "Acrobatics",
                                icon: `modules/transformations/icons/skills/Acrobatics.png`,
                                raw: `skills:${SKILL.ACROBATICS}`,
                                value: SKILL.ACROBATICS,
                                mode: "forcedExpertise"
                            },
                            {
                                id: SKILL.ARCANA,
                                label: "Arcana",
                                icon: `modules/transformations/icons/skills/Arcana.png`,
                                raw: `skills:${SKILL.ARCANA}`,
                                value: SKILL.ARCANA,
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: SKILL.ACROBATICS,
                                naturalRoll: 1,
                                total: 1
                            }
                        }
                    })
                    await waiters.waitForCondition(() =>
                        actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 2
                    )
                    await runtime.services.triggerRuntime.run("longRest", actor)
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 1
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                        longRestsLeftUntilFullHitDieRestoration: 1
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 0
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Unsurpassed Fortune no uses used on success`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Unsurpassed Fortune")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Unsurpassed Fortune")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, assert, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unsurpassed Fortune chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnsurpassedFortune")

                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 6
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(6)

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.addItem(item => {
                        item.itemName = "Gift of Unsurpassed Fortune"
                        item.usesLeft = 1
                        item.uses = 1
                    })
                    validate(actorDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unsurpassed Fortune uses used on fail`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Unsurpassed Fortune")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Unsurpassed Fortune")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, assert, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unsurpassed Fortune chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnsurpassedFortune")

                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 5
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(5)

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.addItem(item => {
                        item.itemName = "Gift of Unsurpassed Fortune"
                        item.usesLeft = 0
                        item.uses = 1
                    })
                    validate(actorDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: "Fiend Form hide fiend form",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
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

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on bloodied",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "bloodied",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on bloodied",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "bloodied",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on unconscious",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "unconscious",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on unconscious",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "unconscious",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on beginConcentration",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "concentration",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on beginConcentration",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
                }
            ],

            trigger: "concentration",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: `Enhanced Contract consumes item use on gift of Damnation`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                }
            ],

            steps: [
                async ({actor, runtime}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                }
            ],

            await: async ({
                actor,
                waiters,
                runtime
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForNextFrame()
                await waiters.waitForCondition(() =>
                    actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                )
            },

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [10, "temp"]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.usesLeft = 0
                })
                validate(actorDto, {assert})
            }
        },

        {
            name: `Enhanced Contract no temp hp added if no charges left when activating gift of Damnation`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
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
                }
            ],

            steps: [
                async ({actor, runtime}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                }
            ],

            await: async ({
                actor,
                waiters,
                runtime
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForNextFrame()
                await waiters.waitForCondition(() =>
                    actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                )
                await actor.update({
                    "system.attributes.hp.temp": 0
                })
                const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                await runtime.services.applyFiendGiftOfDamnation({actor, gift})
            },

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [0, "temp"]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.usesLeft = 0
                })
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Unfettered Glory increases hitDiereduction after hit die roll`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    await applyGiftOfUnfetteredGloryAndTriggerHitDie({
                        actor,
                        runtime,
                        waiters,
                        staticVars
                    })
                }
            ],

            await: async ({actor, waiters}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfUnfetteredGlory?.hitDieModifier === 2
                )
            },

            assertions: async ({actor, assert, staticVars}) =>
            {
                assert.deepEqual(
                    staticVars.context.rolls[0].parts,
                    ["1d8"]
                )
                assert.equal(
                    actor.flags?.transformations?.fiend?.giftOfUnfetteredGlory?.hitDieModifier,
                    2
                )
            }
        },

        {
            name: `Gift of Unfettered Glory adds -2 to hit die roll`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    await applyGiftOfUnfetteredGloryAndTriggerHitDie({
                        actor,
                        runtime,
                        waiters,
                        staticVars
                    })
                    const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                    transformation.TransformationClass.onPreRollHitDie(staticVars.context, actor)
                }
            ],

            assertions: async ({staticVars, assert}) =>
            {
                assert.deepEqual(
                    staticVars.context.rolls[0].parts,
                    ["1d8-2"]
                )
            }
        },

        {
            name: `Devilish Subcontractor makes it possible to have two gifts of damnation at the same time`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                            3: "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
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
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                    const gift2 = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift2})
                }
            ],

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemsWithSourceUuid = [
                    "Compendium.transformations.gh-transformations.Item.97GBQgFFed1p1vMJ",
                    "Compendium.transformations.gh-transformations.Item.zzXZ3tex07ScSN5L"
                ]
                validate(actorDto, {assert})
            }
        },

        {
            name: `Devilish Subcontractor can replace one of two gifts of damnation via choice dialog`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                            3: "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
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
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    const gift2 = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift: gift2})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune") &&
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    await waiters.waitForCondition(() =>
                        actor.effects.some(effect =>
                            effect.flags?.transformations?.giftOfDamnationId === "giftOfJoyousLife"
                        )
                    )

                    const giftOfJoyousLifeEffect = actor.effects.find(effect =>
                        effect.flags?.transformations?.giftOfDamnationId === "giftOfJoyousLife"
                    )

                    const gift3 = giftsOfDamnation.find(entry => entry.id === "giftOfUnfetteredGlory")
                    const applyGiftPromise = runtime.services.applyFiendGiftOfDamnation({
                        actor,
                        gift: gift3
                    })

                    const dialog = await findTransformationGeneralChoiceDialog(actor)
                    staticVars.removalDialogTitle =
                        getTransformationGeneralChoiceDialogWindowTitle(dialog)?.textContent?.trim()
                    staticVars.removalDialogChoices = [...dialog.querySelectorAll(".choice-button")]
                    .map(button => button.textContent.trim())

                    const removeGiftOfJoyousLifeButton =
                              await findTransformationGeneralChoiceButtonById(
                                  dialog,
                                  giftOfJoyousLifeEffect.id
                              )

                    removeGiftOfJoyousLifeButton.click()

                    await waiters.waitForNextFrame()
                    await waiters.waitForElementGone({
                        selector: `#transformation-general-choice-${actor.id}`
                    })

                    await applyGiftPromise
                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune") &&
                        actor.items.some(i => i.name === "Gift of Unfettered Glory") &&
                        !actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                }
            ],

            assertions: async ({actor, assert, staticVars}) =>
            {
                assert.equal(
                    staticVars.removalDialogTitle,
                    "choose an effect to remove"
                )
                assert.sameMembers(
                    staticVars.removalDialogChoices,
                    [
                        "Gift of Unsurpassed Fortune",
                        "Gift of Joyous Life"
                    ]
                )

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemsWithSourceUuid = [
                    "Compendium.transformations.gh-transformations.Item.97GBQgFFed1p1vMJ",
                    "Compendium.transformations.gh-transformations.Item.RyzgJyXTAcpO0hRn"
                ]
                validate(actorDto, {assert})
            }
        }
    ]
}
