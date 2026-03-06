import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../../config/constants.js"
import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog } from "../../../selectors/transformationGeneralChoiceDialog.finders.js"

// test/definitions/aberrantHorror.testdef.js
const seasons = {
    winter: {
        name: "Winter",
        servantUuid: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.b8QaSuxO1nh8XHAY",
        twoFacedStatusEffect: "frightened",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.H1unaVkxHYemhwF5",
        magicTricksSpells: [
            "Compendium.transformations.gh-transformations.Item.Z39OZS5HrubgAbJL",
            "Compendium.transformations.gh-transformations.Item.dgYEkwNt7bp9F6Yj",
            "Compendium.transformations.gh-transformations.Item.CvnXPXDMoNw6XyLy",
        ],
        feyTeleportDamageType: "cold"
    },
    spring: {
        name: "Spring",
        servantUuid: "Compendium.transformations.gh-transformations.Item.Xyi6Tr9bECEaphLf",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.K62U8AeluSIM9oeI",
        twoFacedStatusEffect: "stunned",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.GfXOtsRa8JYaiUeH",
        magicTricksSpells: [
            "Compendium.transformations.gh-transformations.Item.aF8b9e0KBKhBb2Af",
            "Compendium.transformations.gh-transformations.Item.JfL1yuWjDiJAac2V",
            "Compendium.transformations.gh-transformations.Item.Pcn3yjh4NbYs2Ec7",
        ],
        feyTeleportDamageType: "thunder"
    },
    summer: {
        name: "Summer",
        servantUuid: "Compendium.transformations.gh-transformations.Item.5kw0TvhNgqsrOhR3",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.WH4ZBcfktnkAZhhp",
        twoFacedStatusEffect: "charmed",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.65VksuhlhiIJINcM",
        magicTricksSpells: [
            "Compendium.transformations.gh-transformations.Item.eOoj2xXW0beg0DPt",
            "Compendium.transformations.gh-transformations.Item.D7TUKogaloUL97E7",
            "Compendium.transformations.gh-transformations.Item.pSZsUoI3D1V9Bot2",
        ],
        feyTeleportDamageType: "fire"
    },
    autumn: {
        name: "Autumn",
        servantUuid: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.I1PqqMLyPa6jPagx",
        twoFacedStatusEffect: "poisoned",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.xOebV0euA9zB8qeY",
        magicTricksSpells: [
            "Compendium.transformations.gh-transformations.Item.6rTGRPz9LTviIN0P",
            "Compendium.transformations.gh-transformations.Item.JJWjhhJEgnV0xFnT",
            "Compendium.transformations.gh-transformations.Item.usF8FEGtQuKhEjeH",
        ],
        feyTeleportDamageType: "poison"
    },

}
export const feyTestDef = {
    id: "fey",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) => `stage 1 with Servant of the ${loopVars.name}  Court`,
            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],

            steps: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, assert, validators, loopVars }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    loopVars.servantUuid
                ]
                assert.isTrue(
                    validators.actorValidator({ runtime, actor, assert })
                        .validateItemsOnActor({ expectedItemUuids })
                        .validateRaceItemSubTypeOnActor("Fey")
                        .validate()
                )
            }
        },

        {
            name: (loopVars) => `stage 2 with Servant of the ${loopVars.name}  Court`,
            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],

            steps: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, assert, validators, loopVars }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Ge8HWhiAqbjKhhZJ",
                    loopVars.servantUuid,
                    loopVars.magicTricksUuid,
                    loopVars.twoFacedUuid,
                    ...loopVars.magicTricksSpells
                ]
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor({ expectedItemUuids })
                        .validate()
                )
            }
        },

        {
            name: (loopVars) => `stage 3 with Servant of the ${loopVars.name}  Court`,
            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],

            steps: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, assert, validators, loopVars }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Ge8HWhiAqbjKhhZJ",
                    "Compendium.transformations.gh-transformations.Item.2OaLTqox7kaidOxP",
                    "Compendium.transformations.gh-transformations.Item.rID40yYHDRry6TJ5",
                    "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    loopVars.servantUuid,
                    loopVars.magicTricksUuid,
                    loopVars.twoFacedUuid,
                    ...loopVars.magicTricksSpells
                ]
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor({ expectedItemUuids })
                        .validate()
                )
            }
        },
    ],

    itemBehaviorTests: [
        {
            name: (vars) =>
                `Fey Form applies ${vars.damageType} resistance on longrest`,

            loop: () => [
                { damageType: "acid" },
                { damageType: "cold" },
                { damageType: "fire" },
                { damageType: "lightning" },
                { damageType: "psychic" },
                { damageType: "thunder" }
            ],
            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: seasons.winter.servantUuid
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1,
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters, loopVars }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: loopVars.damageType })
                }
            ],

            await: async ({
                waiters,
                actor
            }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.traits.dr.value.size > 0
                )
            },

            assertions: async ({ actor, assert, validators, loopVars }) =>
            {
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateNumberOfDamageResistances(1)
                        .hasDamageResistances([loopVars.damageType])
                        .validateNumberOfEffects(1)
                        .hasEffect("Fey Form Resistance")
                        .validate()
                )
            }
        },

        {
            name: (vars) => `Fey Form removes previous resistance on longrest`,

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: seasons.winter.servantUuid
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1,
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters, loopVars }) =>
                {

                    await runtime.infrastructure.activeEffectRepository.create({
                        actor,
                        name: "Fey Form Resistance",
                        description: "Your Fey Form grants you resistance to acid",
                        icon: "modules/transformations/icons/Transformations/Fey/Fey_Form.png",
                        changes: [
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "acid"
                            }
                        ],

                        flags: {
                            transformations: {
                                removeOnLongRest: true
                            }
                        },
                        origin: actor.uuid,
                        source: "Fey Form"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.traits.dr.value.has("acid")
                    )

                    await waiters.waitForNextFrame()

                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "cold" })
                },
            ],

            await: async ({
                waiters,
                actor
            }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.traits.dr.value.has("cold")
                )
            },

            assertions: async ({ actor, assert, validators, loopVars }) =>
            {
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateNumberOfDamageResistances(1)
                        .hasDamageResistances(["cold"])
                        .validateNumberOfEffects(1)
                        .hasEffect("Fey Form Resistance")
                        .validate()
                )
            }
        },

        {
            name: (vars) =>
                `Servant of the ${vars.name} Court activities`,

            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],
            requiredPath: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "acid" })
                }
            ],

            await: async ({
                waiters,
                actor
            }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.traits.dr.value.size > 0
                )
            },

            assertions: async ({ actor, assert, validators, runtime, loopVars }) =>
            {
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor({ itemName: `Servant of the ${loopVars.name} Court` })

                        .item.hasNumberOfActivities(1)
                        .hasActivity("Fey Teleport")

                        .activity.validateActivationType("bonus")
                        .validateRangeValue(30)
                        .hasDamagePart()

                        .damagePart.validateIncludesDamageTypes([loopVars.feyTeleportDamageType])
                        .validateDamageRoll("1d6")
                        .validate()
                )
            }
        },

        {
            name: "Planar Bindings disadvantage on saving throw",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "acid" })
                }
            ],

            assertions: async ({ actor, assert, validators, runtime, helpers }) =>
            {
                const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                const context = helpers.getPreRollSavingThrowContext({
                    ability: "dex",
                    originType: "spell"
                })
                await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })

                assert.isTrue(
                    validators.contextValidator({ context, assert })
                        .validateSavingThrowDisadvantage(true)
                        .validateSavingThrowAdvantage(null)
                        .validate()
                )

                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateActorOnceFlag("fey-plannar-binding-disadvantage", { executed: true, reset: ["longRest", "shortRest"] })
                        .validate()
                )
            }
        },

        {
            name: (vars) => `Two-Faced with ${vars.name} court`,

            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],
            requiredPath: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid
                },
                {
                    stage: 2
                }
            ],

            await: async ({ runtime, actor, waiters }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, runtime, validators, loopVars }) =>
            {
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor({ itemName: "Two-Faced" })

                        .item.hasNumberOfActivities(1)
                        .hasActivity("Transform Face")

                        .activity.validateActivationType("action")
                        .hasNumberOfConsumptionTargets(1)
                        .hasConsumptionTarget()

                        .consumptionTarget.validateType("itemUses")
                        .validateValue("1")
                        .validate()
                )

                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor({ itemName: "Two-Faced" })

                        .item.hasActivity("Transform Face")

                        .activity.hasNumberOfEffects(1)
                        .hasEffect(loopVars.twoFacedStatusEffect)

                        .effect.validateStatuses([loopVars.twoFacedStatusEffect])
                        .validate()
                )
            }
        },

        {
            name: (vars) => `Magic tricks with ${vars.name} court`,

            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],
            requiredPath: [
                {
                    stage: 1,
                    choose: (loopVars) => loopVars.servantUuid
                },
                {
                    stage: 2
                }
            ],

            await: async ({ runtime, actor, waiters }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, runtime, validators, loopVars }) =>
            {
                assert.isTrue(
                    validators.actorValidator({ actor, assert })
                        .validateItemsOnActor(loopVars.magicTricksUuid)

                        .item.validateNumberOfAdvancements(1)
                        .hasAdvancement()

                        .advancement.validateNumberOfConfigurationItems(3)
                )
                const magicTricks = actor.items.find(i => i.flags.transformations.sourceUuid == loopVars.magicTricksUuid)
                expect(magicTricks).to.exist

                const advancements = magicTricks.system.advancement
                expect(advancements.length).to.be.equal(1)

                const configurationItems = advancements[0].configuration.items
                expect(configurationItems.length).to.be.equal(3)
                for (const item of configurationItems) {
                    const actorItem = actor.items.find(i => i.flags.transformations.sourceUuid == item.uuid)
                    expect(actorItem).to.exist
                    expect(actorItem.flags.transformations.awardedByItem).to.be.equal(magicTricks.uuid)
                    expect(loopVars.magicTricksSpells).to.include.members([actorItem.flags.transformations.sourceUuid])

                    const itemSystem = actorItem.system
                    expect(itemSystem.prepared).to.be.equal(2)

                    if (itemSystem.level > 0) {
                        const itemUses = itemSystem.uses
                        expect(itemUses.max).to.be.equal(1)
                        expect(itemUses.value).to.be.equal(1)
                        expect(itemUses.recovery[0].period).to.be.equal("lr")
                        expect(itemUses.recovery[0].type).to.be.equal("recoverAll")
                    }

                    if (actorItem.hasSave) {
                        const saveActivity = actorItem.system.activities.find(a => a.type == "save")
                        expect(saveActivity.save.dc.formula).to.be.equal("8 + @prof + @flags.transformations.stage")
                        expect(saveActivity.save.dc.value).to.be.equal(11)
                    }

                }
            }
        },

        {
            name: "Queen's Command has suspended effect as default",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid
                },
                {
                    stage: 2
                }
            ],

            assertions: async ({ actor, expect, assert, runtime, helpers }) =>
            {
                const queensCommand = actor.items.find(i => i.name == "Queen's Command")
                expect(queensCommand).to.exist

                const actorEffects = actor.effects.contents
                expect(actorEffects.length).to.be.equal(0)

                const itemEffects = queensCommand.effects.contents
                expect(itemEffects.length).to.be.equal(1)
                expect(itemEffects[0].changes.length).to.be.equal(0)
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.exist
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.be.equal(true)
            }
        },

        {
            name: "Queen's Command effect gets all the changes and sets flag to false on update",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters, loopVars }) =>
                {
                    const itemEffect = actor.items.find(i => i.name == "Queen's Command").effects.contents[0]
                    await itemEffect.update({ disabled: false })
                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                }
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                {
                    const queensCommand = actor.items.find(i => i.name === "Queen's Command")
                    const effect = queensCommand?.effects?.contents?.[0]
                    return effect?.flags?.transformations?.addDisadvantageAllD20 === false
                })
            },

            assertions: async ({ actor, expect, assert, runtime, helpers }) =>
            {
                const queensCommand = actor.items.find(i => i.name == "Queen's Command")
                const itemEffects = queensCommand.effects.contents

                expect(queensCommand).to.exist

                expect(itemEffects.length).to.be.equal(1)
                expect(itemEffects[0].changes.length).to.be.equal(34)
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.exist
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.be.equal(false)
                helpers.validateAllD20Disadvantage(actor, helpers.actorValidator, assert)
            }
        },

        {
            name: "Illusionary Cloak effect gets all the changes and sets flag to false on update",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.items.find(i => i.name === "Illusionary Cloak")
                )
            },

            assertions: async ({ actor, expect, assert, runtime, helpers }) =>
            {
                const spell = actor.items.find(i => i.name == "Illusionary Cloak")
                expect(spell).to.exist
                expect(spell.type).to.be.equal("spell")

                const effects = spell.effects.contents
                expect(effects.size).to.be.equal(1)

                const effect = effects[0]
                expect(effect.duration.seconds).to.be.equal(3600)

                const spellSystem = spell.system
            }
        },

    ]
}
