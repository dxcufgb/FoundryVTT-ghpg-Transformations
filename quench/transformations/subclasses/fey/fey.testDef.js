import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../../config/constants.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"
import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog } from "../../../selectors/transformationGeneralChoiceDialog.finders.js"

// test/definitions/aberrantHorror.testdef.js
const seasons = {
    winter: {
        name: "Winter",
        servantUuid: "Compendium.transformations.gh-transformations.Item.H8lRQe1N60tJ5Yf5",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.b8QaSuxO1nh8XHAY",
        twoFacedStatusEffectName: "Frightened",
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
        twoFacedStatusEffectName: "Stunned",
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
        twoFacedStatusEffectName: "Charmed",
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
        twoFacedStatusEffectName: "Poisoned",
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

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    loopVars.servantUuid
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Fey"
                })
                validate(actorDto, { assert })
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

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
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
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
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

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
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
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
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

            assertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.resistances = [loopVars.damageType]
                actorDto.effects.has.push("Fey Form Resistance")
                validate(actorDto, { assert })
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

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.resistances = ["cold"]
                actorDto.effects.has.push("Fey Form Resistance")
                validate(actorDto, { assert })
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

            assertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = `Servant of the ${loopVars.name} Court`
                    item.numberOfActivities = 1
                    item.addActivity(activity =>
                    {
                        activity.name = "Fey Teleport"
                        activity.activationType = "bonus"
                        activity.addDamagePart(part =>
                        {
                            part.damageTypes = [loopVars.feyTeleportDamageType]
                            part.roll = "1d6"
                        })
                    })
                })
                validate(actorDto, { assert })

                const feyTeleport = actor.items
                    .find(i => i.name === `Servant of the ${loopVars.name} Court`)
                    ?.system?.activities?.contents
                    ?.find(a => a.name === "Fey Teleport")

                assert.equal(feyTeleport?.range?.value, 30)
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

            assertions: async ({ actor, assert, runtime, helpers }) =>
            {
                const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                const context = helpers.getPreRollSavingThrowContext({
                    ability: "dex",
                    originType: "spell"
                })
                await transformation.TransformationClass.onPreRollSavingThrow(actor, context, { onceService: runtime.infrastructure.onceService })

                const contextDto = new ContextValidationDTO(context)
                contextDto.disadvantage = true
                contextDto.advantage = null
                validate(contextDto, { assert })

                assert.deepEqual(
                    actor.flags.transformations.once["fey-plannar-binding-disadvantage"],
                    { executed: true, reset: ["longRest", "shortRest"] }
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

            assertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Two-Faced"
                    item.numberOfActivities = 1
                    item.addActivity(activity =>
                    {
                        activity.name = "Transform Face"
                        activity.activationType = "action"
                        activity.addConsumption(consumption =>
                        {
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.addEffect(effect =>
                        {
                            effect.name = loopVars.twoFacedStatusEffectName
                            effect.statuses = [loopVars.twoFacedStatusEffect]
                        })
                    })
                })
                validate(actorDto, { assert })
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

            assertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [loopVars.magicTricksUuid, ...loopVars.magicTricksSpells]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [loopVars.magicTricksUuid]
                })
                validate(actorDto, { assert })

                const magicTricks = actor.items.find(i => i.flags.transformations.sourceUuid == loopVars.magicTricksUuid)

                const advancements = magicTricks?.system?.advancement
                assert.equal(advancements?.length, 1)

                const configurationItems = advancements?.[0]?.configuration?.items ?? []
                assert.equal(configurationItems.length, 3)
                for (const item of configurationItems) {
                    const actorItem = actor.items.find(i => i.flags.transformations.sourceUuid == item.uuid)
                    assert.equal(actorItem?.flags?.transformations?.awardedByItem, magicTricks?.uuid)
                    assert.includeMembers(loopVars.magicTricksSpells, [actorItem?.flags?.transformations?.sourceUuid])

                    const itemSystem = actorItem?.system
                    assert.equal(itemSystem?.prepared, 2)

                    if (itemSystem?.level > 0) {
                        const itemUses = itemSystem?.uses
                        assert.equal(itemUses?.max, 1)
                        assert.equal(itemUses?.value, 1)
                        assert.equal(itemUses?.recovery?.[0]?.period, "lr")
                        assert.equal(itemUses?.recovery?.[0]?.type, "recoverAll")
                    }

                    if (actorItem?.hasSave) {
                        const saveActivity = actorItem?.system?.activities?.find(a => a.type == "save")
                        assert.equal(saveActivity?.save?.dc?.formula, "8 + @prof + @flags.transformations.stage")
                        assert.equal(saveActivity?.save?.dc?.value, 11)
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

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects.count = 0
                actorDto.addItem(item =>
                {
                    item.itemName = "Queen's Command"
                    item.numberOfEffects = 1
                })
                validate(actorDto, { assert })

                const itemEffects = actor.items.find(i => i.name == "Queen's Command")?.effects?.contents ?? []
                assert.equal(itemEffects.length, 1)
                assert.equal(itemEffects[0]?.changes?.length, 0)
                assert.property(itemEffects[0]?.flags?.transformations ?? {}, "addDisadvantageAllD20")
                assert.equal(itemEffects[0]?.flags?.transformations?.addDisadvantageAllD20, true)
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

            assertions: async ({ actor, assert, helpers, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Queen's Command"
                    item.numberOfEffects = 1
                })
                validate(actorDto, { assert })

                const itemEffects = actor.items.find(i => i.name == "Queen's Command")?.effects?.contents ?? []

                assert.equal(itemEffects.length, 1)
                assert.equal(itemEffects[0]?.changes?.length, 34)
                assert.property(itemEffects[0]?.flags?.transformations ?? {}, "addDisadvantageAllD20")
                assert.equal(itemEffects[0]?.flags?.transformations?.addDisadvantageAllD20, false)
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

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Illusionary Cloak"
                    item.type = "spell"
                    item.numberOfEffects = 1
                })
                validate(actorDto, { assert })

                const effects = actor.items.find(i => i.name == "Illusionary Cloak")?.effects?.contents ?? []
                const effectsCount = effects?.size ?? effects?.length ?? 0
                assert.equal(effectsCount, 1)

                const effect = effects[0]
                assert.equal(effect?.duration?.seconds, 3600)
            }
        },

    ]
}
