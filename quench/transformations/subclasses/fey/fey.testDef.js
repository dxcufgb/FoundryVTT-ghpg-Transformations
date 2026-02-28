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

            finalAssertions: async ({ runtime, actor, expect, helpers, loopVars }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    loopVars.servantUuid
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Fey", actor, expect)
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

            finalAssertions: async ({ runtime, actor, expect, helpers, loopVars }) =>
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
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
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

            assertions: async ({ actor, expect, loopVars }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    loopVars.damageType
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
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

            assertions: async ({ actor, expect, runtime, loopVars }) =>
            {
                const courtItem = actor.items.find(i => i.name == `Servant of the ${loopVars.name} Court`)
                expect(courtItem).to.exist

                const activities = courtItem.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const feyTeleport = activities.find(a => a.name == "Fey Teleport")
                expect(feyTeleport).to.exist
                expect(feyTeleport.activation.type).to.be.equal("bonus")
                expect(feyTeleport.damage.parts[0].number).to.be.equal(1)
                expect(feyTeleport.damage.parts[0].denomination).to.be.equal(6)
                expect(feyTeleport.damage.parts[0].types).to.include.members([loopVars.feyTeleportDamageType])
                expect(feyTeleport.range.value).to.be.equal(30)
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

            assertions: async ({ actor, expect, runtime, helpers }) =>
            {
                const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                const context = helpers.getPreRollSavingThrowContext({
                    ability: "dex",
                    originType: "spell"
                })
                await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })

                expect(context.disadvantage).to.be.true
                expect(context.advantage).to.be.null

                const actorOnceFlags = actor.flags.transformations.once
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"]).to.exist
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].executed).to.be.true
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].reset.length).to.be.equal(2)
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].reset).to.include.members(["longRest", "shortRest"])
            }
        },

        {
            name: "Planar Bindings no disadvantage on saving throw when item type is not spell",

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

            assertions: async ({ actor, expect, runtime, helpers }) =>
            {
                const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                const context = helpers.getPreRollSavingThrowContext({
                    ability: "dex",
                    originType: "not spell"
                })
                await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })

                expect(context.disadvantage).to.be.null
                expect(context.advantage).to.be.null

                const actorTransformationsFlags = actor.flags.transformations
                expect(actorTransformationsFlags.once).to.not.exist
            }
        },

        {
            name: "Planar Bindings no disadvantage on saving throw when item type is not spell",

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
                    const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                    const context = helpers.getPreRollSavingThrowContext({
                        ability: "dex",
                        originType: "spell"
                    })
                    await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })
                }
            ],

            assertions: async ({ actor, expect, runtime, helpers }) =>
            {
                const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                const context = helpers.getPreRollSavingThrowContext({
                    ability: "dex",
                    originType: "spell"
                })
                await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })

                expect(context.disadvantage).to.be.null
                expect(context.advantage).to.be.null

                const actorOnceFlags = actor.flags.transformations.once
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"]).to.exist
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].executed).to.be.true
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].reset.length).to.be.equal(2)
                expect(actorOnceFlags["fey-plannar-binding-disadvantage"].reset).to.include.members(["longRest", "shortRest"])
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

            assertions: async ({ actor, expect, runtime, helpers, loopVars }) =>
            {
                const twoFaced = actor.items.find(i => i.name == "Two-Faced")
                expect(twoFaced).to.exist

                const activities = twoFaced.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const save = activities.find(a => a.name == "Transform face")
                expect(save.activation.type).to.be.equal("action")

                const consumption = save.consumption
                expect(consumption.targets.length).to.be.equal(1)

                const consumptionTarget = consumption.targets[0]
                expect(consumptionTarget.type).to.be.equal("itemUses")
                expect(consumptionTarget.value).to.be.equal("1")

                const saveEffects = save.effects
                expect(saveEffects.length).to.be.equal(1)

                const saveEffect = saveEffects[0].effect
                expect(saveEffect.name).to.be.equal(runtime.dependencies.utils.stringUtils.capitalize(loopVars.twoFacedStatusEffect))
                expect(saveEffect.statuses).to.include.members([loopVars.twoFacedStatusEffect])
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

            assertions: async ({ actor, expect, runtime, helpers, loopVars }) =>
            {
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
                const itemEffects = queensCommand.effects.contents[0]

                expect(queensCommand).to.exist

                expect(itemEffects.length).to.be.equal(1)
                expect(itemEffects[0].changes.length).to.be.equal(34)
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.exist
                expect(itemEffects[0].flags.transformations.addDisadvantageAllD20).to.be.equal(false)
                helpers.validateAllD20Disadvantage(actor, helpers.actorValidators, assert)
            }
        },

    ]
}
