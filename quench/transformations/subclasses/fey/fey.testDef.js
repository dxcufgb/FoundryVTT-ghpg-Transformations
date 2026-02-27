import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../../config/constants.js"
import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog } from "../../../selectors/transformationGeneralChoiceDialog.finders.js"

// test/definitions/aberrantHorror.testdef.js
export const feyTestDef = {
    id: "fey",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: "stage 1 with Servant of the Winter Court",
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Fey", actor, expect)
            }
        },

        {
            name: "stage 1 with Servant of the Spring Court",
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Xyi6Tr9bECEaphLf",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Xyi6Tr9bECEaphLf"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Fey", actor, expect)
            }
        },

        {
            name: "stage 1 with Servant of the Summer Court",
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5kw0TvhNgqsrOhR3",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.5kw0TvhNgqsrOhR3"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Fey", actor, expect)
            }
        },

        {
            name: "stage 1 with Servant of the Autumn Court",
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Fey", actor, expect)
            }
        },
    ],

    itemBehaviorTests: [
        {
            name: "Fey Form applies acid damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "acid"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Fey Form applies cold damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
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
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "cold" })
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "cold"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Fey Form applies fire damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "fire" })
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "fire"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Fey Form applies lightning damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "lightning" })
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "lightning"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Fey Form applies psychic damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "psychic" })
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "psychic"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Fey Form applies thunder damage resistance on longrest",

            setup: async ({ actor }) => 
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({ actor, runtime, helpers, waiters }) =>
                {
                    await helpers.fey.chooseDamageResistanceOnLongRest({ waiters, runtime, actor, choice: "thunder" })
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

            assertions: async ({ actor, expect }) =>
            {
                const actorResistances = actor.system.traits.dr.value
                expect(actorResistances.size).to.be.equal(1)
                expect(actorResistances).to.include.members([
                    "thunder"
                ])

                const actorEffects = actor.effects
                expect(actorEffects.size).to.be.equal(1)
                expect(actorEffects.contents[0].name).to.be.equal("Fey Form Resistance")
            }
        },

        {
            name: "Servant of the Spring Court activities",

            requiredPath: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.Xyi6Tr9bECEaphLf"
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

            assertions: async ({ actor, expect }) =>
            {
                const courtItem = actor.items.find(i => i.name == "Servant of the Spring Court")
                expect(courtItem).to.exist

                const activities = courtItem.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const feyTeleport = activities.find(a => a.name == "Fey Teleport")
                expect(feyTeleport).to.exist
                expect(feyTeleport.activation.type).to.be.equal("bonus")
                expect(feyTeleport.damage.parts[0].number).to.be.equal(1)
                expect(feyTeleport.damage.parts[0].denomination).to.be.equal(6)
                expect(feyTeleport.damage.parts[0].types).to.include.members(["thunder"])
                expect(feyTeleport.range.value).to.be.equal(30)
            }
        },

        {
            name: "Servant of the Summer Court activities",

            requiredPath: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5kw0TvhNgqsrOhR3"
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

            assertions: async ({ actor, expect }) =>
            {
                const courtItem = actor.items.find(i => i.name == "Servant of the Summer Court")
                expect(courtItem).to.exist

                const activities = courtItem.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const feyTeleport = activities.find(a => a.name == "Fey Teleport")
                expect(feyTeleport).to.exist
                expect(feyTeleport.activation.type).to.be.equal("bonus")
                expect(feyTeleport.damage.parts[0].number).to.be.equal(1)
                expect(feyTeleport.damage.parts[0].denomination).to.be.equal(6)
                expect(feyTeleport.damage.parts[0].types).to.include.members(["fire"])
                expect(feyTeleport.range.value).to.be.equal(30)
            }
        },

        {
            name: "Servant of the Autumn Court activities",

            requiredPath: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP"
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

            assertions: async ({ actor, expect }) =>
            {
                const courtItem = actor.items.find(i => i.name == "Servant of the Autumn Court")
                expect(courtItem).to.exist

                const activities = courtItem.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const feyTeleport = activities.find(a => a.name == "Fey Teleport")
                expect(feyTeleport).to.exist
                expect(feyTeleport.activation.type).to.be.equal("bonus")
                expect(feyTeleport.damage.parts[0].number).to.be.equal(1)
                expect(feyTeleport.damage.parts[0].denomination).to.be.equal(6)
                expect(feyTeleport.damage.parts[0].types).to.include.members(["poison"])
                expect(feyTeleport.range.value).to.be.equal(30)
            }
        },

        {
            name: "Servant of the Winter Court activities",

            requiredPath: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5"
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

            assertions: async ({ actor, expect }) =>
            {
                const courtItem = actor.items.find(i => i.name == "Servant of the Winter Court")
                expect(courtItem).to.exist

                const activities = courtItem.system.activities.contents
                expect(activities.length).to.be.equal(1)

                const feyTeleport = activities.find(a => a.name == "Fey Teleport")
                expect(feyTeleport).to.exist
                expect(feyTeleport.activation.type).to.be.equal("bonus")
                expect(feyTeleport.damage.parts[0].number).to.be.equal(1)
                expect(feyTeleport.damage.parts[0].denomination).to.be.equal(6)
                expect(feyTeleport.damage.parts[0].types).to.include.members(["cold"])
                expect(feyTeleport.range.value).to.be.equal(30)
            }
        },

        {
            name: "Planar Bindings disadvantage on saving throw",

            requiredPath: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5"
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
                    choose: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5"
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
                    choose: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5"
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
    ]
}
