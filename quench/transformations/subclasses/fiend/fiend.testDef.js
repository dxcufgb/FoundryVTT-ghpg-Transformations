import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { giftsOfDamnation } from "../../../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js";

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
        }
    ]
}
