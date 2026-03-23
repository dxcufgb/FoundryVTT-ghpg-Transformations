import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { giftsOfDamnation } from "../../../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js";
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
        }
    ]
}
