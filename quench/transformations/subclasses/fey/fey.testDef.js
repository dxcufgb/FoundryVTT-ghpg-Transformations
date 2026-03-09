import { UiAccessor } from "../../../../bootstrap/uiAccessor.js"
import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../../config/constants.js"
import { D20Identifiers } from "../../../../config/disadvantageOnAllD20Rolls.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"
import { MessageValidationDTO } from "../../../helpers/validationDTOs/message/MessageValidationDTO.js"
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
            {
                uuid: "Compendium.transformations.gh-transformations.Item.Z39OZS5HrubgAbJL",
                level: 0,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.dgYEkwNt7bp9F6Yj",
                level: 1,
                saveActivityName: "Shard Explosion",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.CvnXPXDMoNw6XyLy",
                level: 2,
                saveActivityName: false,
            }
        ],
        feyTeleportDamageType: "cold",
        seasonallyAffectedUuid: "Compendium.transformations.gh-transformations.Item.6PW6iYp8v7UoREu4",
        seasonallyAffectedDamageVulnerability: "fire",
        greaterMagicTricksUuid: "Compendium.transformations.gh-transformations.Item.gy5fj1wcUtnAR5yE",
        greaterMagicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.ohE2j7tJ9OdnYtbK",
                level: 3,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.XBhEOfOXg987Oryu",
                level: 4,
                saveActivityName: "Midi Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.TdEFNeRQPS3Ys95k",
                level: 5,
                saveActivityName: "Midi Save",
            }
        ],
    },
    spring: {
        name: "Spring",
        servantUuid: "Compendium.transformations.gh-transformations.Item.Xyi6Tr9bECEaphLf",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.K62U8AeluSIM9oeI",
        twoFacedStatusEffectName: "Stunned",
        twoFacedStatusEffect: "stunned",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.GfXOtsRa8JYaiUeH",
        magicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.aF8b9e0KBKhBb2Af",
                level: 2,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.JfL1yuWjDiJAac2V",
                level: 0,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.Pcn3yjh4NbYs2Ec7",
                level: 1,
                saveActivityName: false,
            },
        ],
        feyTeleportDamageType: "thunder",
        seasonallyAffectedUuid: "Compendium.transformations.gh-transformations.Item.Zk0cqrKQcOcnzYPz",
        seasonallyAffectedDamageVulnerability: "necrotic",
        greaterMagicTricksUuid: "Compendium.transformations.gh-transformations.Item.gbC98FWfZURNMRHm",
        greaterMagicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.7MHP4HCodAvWMxap",
                level: 3,
                saveActivityName: "Start of Turn Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.wT4Tp9WQ8Qi9oH85",
                level: 4,
                saveActivityName: "Midi Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.cG7yegCP2pLGjcXW",
                level: 5,
                saveActivityName: "Midi Save",
            }
        ],
    },
    summer: {
        name: "Summer",
        servantUuid: "Compendium.transformations.gh-transformations.Item.5kw0TvhNgqsrOhR3",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.WH4ZBcfktnkAZhhp",
        twoFacedStatusEffectName: "Charmed",
        twoFacedStatusEffect: "charmed",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.65VksuhlhiIJINcM",
        magicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.eOoj2xXW0beg0DPt",
                level: 0,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.D7TUKogaloUL97E7",
                level: 2,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.pSZsUoI3D1V9Bot2",
                level: 1,
                saveActivityName: "Midi Save",
            }
        ],
        feyTeleportDamageType: "fire",
        seasonallyAffectedUuid: "Compendium.transformations.gh-transformations.Item.AHxp5W4k9UpOKgEC",
        seasonallyAffectedDamageVulnerability: "cold",
        greaterMagicTricksUuid: "Compendium.transformations.gh-transformations.Item.PhJXnqeDYAzH2RCB",
        greaterMagicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.nRYfP6VNoFbJi2Cl",
                level: 3,
                saveActivityName: "Midi Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.oW1ImnWFEeQ58m8M",
                level: 4,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.ZnuyJAuZauk8atLn",
                level: 5,
                saveActivityName: "Midi Save",
            }
        ],
    },
    autumn: {
        name: "Autumn",
        servantUuid: "Compendium.transformations.gh-transformations.Item.t2LwdWDsPyKrEBoP",
        twoFacedUuid: "Compendium.transformations.gh-transformations.Item.I1PqqMLyPa6jPagx",
        twoFacedStatusEffectName: "Poisoned",
        twoFacedStatusEffect: "poisoned",
        magicTricksUuid: "Compendium.transformations.gh-transformations.Item.xOebV0euA9zB8qeY",
        magicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.6rTGRPz9LTviIN0P",
                level: 1,
                saveActivityName: "Midi Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.JJWjhhJEgnV0xFnT",
                level: 0,
                saveActivityName: false,
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.usF8FEGtQuKhEjeH",
                level: 2,
                saveActivityName: "Midi Save",
            }
        ],
        feyTeleportDamageType: "poison",
        seasonallyAffectedUuid: "Compendium.transformations.gh-transformations.Item.CLeYAvf7sMEZacSL",
        seasonallyAffectedDamageVulnerability: "radiant",
        greaterMagicTricksUuid: "Compendium.transformations.gh-transformations.Item.dDBjm4vBlFRpXKVx",
        greaterMagicTricksSpells: [
            {
                uuid: "Compendium.transformations.gh-transformations.Item.8tmFyQ0LbPZe93c9",
                level: 3,
                saveActivityName: "Midi save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.DgNsvwAXjTtvfcXw",
                level: 4,
                saveActivityName: "Midi Save",
            },
            {
                uuid: "Compendium.transformations.gh-transformations.Item.cK1cNO4jj5GtBBMW",
                level: 5,
                saveActivityName: "Midi Save",
            }
        ],
    },

}

function getMagickTrickItem(actor, itemUuid, awardedByItemUuid, spellLevel, saveActivityName, item)
{
    const actorProf = actor.system.attributes.prof
    const transformationStage = actor.flags.transformations.stage
    item.expectedItemUuids = [itemUuid]
    item.awardedByItem = awardedByItemUuid
    item.prepared = 2
    item.level
    if (spellLevel > 0) {
        item.uses.max = 1
        item.uses.value = 1
        item.uses.recovery.period = "lr"
        item.uses.recovery.type = "recoverAll"
    }

    if (saveActivityName) {
        item.addActivity(activity =>
        {
            activity.name = saveActivityName
            activity.saveDc = actorProf + transformationStage + 8
        })
    }
    return item
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
            name: (loopVars) => `stage 2 with Servant of the ${loopVars.name} Court choosing Two-Faced`,
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
                    choose: (loopVars) => loopVars.twoFacedUuid,
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
                    loopVars.twoFacedUuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
            }
        },


        {
            name: (loopVars) => `stage 2 with Servant of the ${loopVars.name} Court choosing Magic tricks`,
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
                    choose: (loopVars) => loopVars.magicTricksUuid,
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
                    loopVars.magicTricksSpells[0].uuid,
                    loopVars.magicTricksSpells[1].uuid,
                    loopVars.magicTricksSpells[2].uuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 3 with Servant of the ${loopVars.name} Court choosing Illusionary cloak`,
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
                    choose: (loopVars) => loopVars.twoFacedUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.2OaLTqox7kaidOxP",
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
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    loopVars.servantUuid,
                    loopVars.twoFacedUuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 3 with Servant of the ${loopVars.name} Court choosing Tooth and Claw`,
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
                    choose: (loopVars) => loopVars.twoFacedUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.rID40yYHDRry6TJ5",
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
                    "Compendium.transformations.gh-transformations.Item.rID40yYHDRry6TJ5",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    loopVars.servantUuid,
                    loopVars.twoFacedUuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 3 with Servant of the ${loopVars.name} Court choosing Dreams and Nightmares`,
            loop: () => [
                seasons.winter,
                seasons.spring,
                seasons.summer,
                seasons.autumn
            ],

            setup: async ({ loopVars, actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fey": {
                            1: loopVars.servantUuid,
                            2: loopVars.twoFacedUuid
                        }
                    }
                })
            },

            steps: [
                { stage: 1 },
                { stage: 2 },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
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
                    "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    loopVars.servantUuid,
                    loopVars.twoFacedUuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 4 with Servant of the ${loopVars.name} Court choosing Two-Faced on stage 2 leading to no choice on stage 4`,
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
                    choose: (loopVars) => loopVars.twoFacedUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Ge8HWhiAqbjKhhZJ",
                    "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    "Compendium.transformations.gh-transformations.Item.5IJKGifkWQIVrNgN",
                    loopVars.servantUuid,
                    loopVars.twoFacedUuid,
                    loopVars.seasonallyAffectedUuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                actorDto.stats.vulnerabilities = [loopVars.seasonallyAffectedDamageVulnerability]
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 4 with Servant of the ${loopVars.name} Court choosing Magic Tricks on stage 2 and Greater Magic Tricks on stage 4`,
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
                    choose: (loopVars) => loopVars.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: (loopVars) => loopVars.greaterMagicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Ge8HWhiAqbjKhhZJ",
                    "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    loopVars.servantUuid,
                    loopVars.seasonallyAffectedUuid,
                    loopVars.magicTricksUuid,
                    loopVars.magicTricksSpells[0].uuid,
                    loopVars.magicTricksSpells[1].uuid,
                    loopVars.magicTricksSpells[2].uuid,
                    loopVars.greaterMagicTricksUuid,
                    loopVars.greaterMagicTricksSpells[0].uuid,
                    loopVars.greaterMagicTricksSpells[1].uuid,
                    loopVars.greaterMagicTricksSpells[2].uuid
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                actorDto.stats.vulnerabilities = [loopVars.seasonallyAffectedDamageVulnerability]
                validate(actorDto, { assert })
            }
        },

        {
            name: (loopVars) => `stage 4 with Servant of the ${loopVars.name} Court choosing Magic Tricks on stage 2 and Twilight Glamour on stage 4`,
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
                    choose: (loopVars) => loopVars.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.5IJKGifkWQIVrNgN",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, loopVars, validators }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf",
                    "Compendium.transformations.gh-transformations.Item.tcI2u7gfaXjg2Orr",
                    "Compendium.transformations.gh-transformations.Item.Ge8HWhiAqbjKhhZJ",
                    "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                    "Compendium.transformations.gh-transformations.Item.5IJKGifkWQIVrNgN",
                    loopVars.servantUuid,
                    loopVars.seasonallyAffectedUuid,
                    loopVars.magicTricksUuid,
                    loopVars.magicTricksSpells[0].uuid,
                    loopVars.magicTricksSpells[1].uuid,
                    loopVars.magicTricksSpells[2].uuid,
                ]
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = expectedItemUuids
                actorDto.stats.vulnerabilities = [loopVars.seasonallyAffectedDamageVulnerability]
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
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
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
                        activity.range.value = 30
                        activity.range.units = "ft"
                        activity.addDamagePart(part =>
                        {
                            part.damageTypes = [loopVars.feyTeleportDamageType]
                            part.roll = "1d6"
                        })
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Planar Bindings disadvantage on saving throw",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
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

                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.once.fey-plannar-binding-disadvantage",
                    expected: { executed: true, reset: ["longRest", "shortRest"] }
                })
                validate(actorDto, { assert })
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
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.twoFacedUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
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
                    choose: (loopVars) => loopVars.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
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
                actorDto.hasItemWithSourceUuids = [
                    loopVars.magicTricksUuid,
                    loopVars.magicTricksSpells[0].uuid,
                    loopVars.magicTricksSpells[1].uuid,
                    loopVars.magicTricksSpells[2].uuid
                ]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [loopVars.magicTricksUuid]
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(configuration =>
                        {
                            configuration.items = [
                                loopVars.magicTricksSpells[0].uuid,
                                loopVars.magicTricksSpells[1].uuid,
                                loopVars.magicTricksSpells[2].uuid
                            ]
                            configuration.spell.method = "atwill"
                            configuration.spell.prepared = 0
                            configuration.spell.uses.max = "1"
                            configuration.spell.uses.per = "lr"
                            configuration.spell.uses.requireSlot = false
                        })
                    })
                })
                actorDto.addItem(item =>
                {
                    getMagickTrickItem(actor, loopVars.magicTricksSpells[0].uuid, loopVars.magicTricksUuid, loopVars.magicTricksSpells[0].level, loopVars.magicTricksSpells[0].saveActivityName, item)
                })
                actorDto.addItem(item =>
                {
                    getMagickTrickItem(actor, loopVars.magicTricksSpells[1].uuid, loopVars.magicTricksUuid, loopVars.magicTricksSpells[1].level, loopVars.magicTricksSpells[1].saveActivityName, item)
                })
                actorDto.addItem(item =>
                {
                    getMagickTrickItem(actor, loopVars.magicTricksSpells[2].uuid, loopVars.magicTricksUuid, loopVars.magicTricksSpells[2].level, loopVars.magicTricksSpells[2].saveActivityName, item)
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Queen's Command has suspended effect as default",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
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
                    item.addEffect(effect =>
                    {
                        effect.name = "Queen's Disdain"
                        effect.count = 0
                        effect.changes.count = 0
                        effect.flags.match.push({
                            path: "transformations.addDisadvantageAllD20",
                            expected: true
                        })
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Queen's Command effect gets all the changes and sets flag to false on update",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
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
                actorDto.effects.count = 1
                actorDto.addItem(item =>
                {
                    item.itemName = "Queen's Command"
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Queen's Disdain"
                        effect.count = 0
                        effect.changes.count = 34
                        effect.flags.match.push({
                            path: "transformations.addDisadvantageAllD20",
                            expected: false
                        })
                    })
                })
                for (const ability of D20Identifiers.abilities) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: ability, type: ROLL_TYPE.ABILITY_CHECK },
                        { identifier: ability, type: ROLL_TYPE.SAVING_THROW }
                    )
                }
                for (const attribute of D20Identifiers.attributes) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: attribute }
                    )
                }
                for (const skill of D20Identifiers.skills) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: skill }
                    )
                }
                actorDto.rollModes.toolDisadvantage = "1"
                validate(actorDto, { assert })
            }
        },

        {
            name: "Illusionary Cloak effect gets all the changes and sets flag to false on update",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.2OaLTqox7kaidOxP"
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
                    item.addEffect(effect =>
                    {
                        effect.name = "Illusionary Cloak"
                        effect.duration.seconds = 3600
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Tooth and Claw Manifested attacks",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.rID40yYHDRry6TJ5"
                }
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.items.find(i => i.name === "Tooth and Claw")
                )
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const transformationStage = actor.flags.transformations.stage
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Tooth and Claw"
                    item.type = "weapon"
                    item.numberOfEffects = 1
                    item.uses.max = actorProf + transformationStage
                    item.uses.recovery.period = "lr"
                    item.uses.recovery.type = "recoverAll"
                    item.addEffect(effect =>
                    {
                        effect.name = "Stunned"
                        effect.duration.turns = 1
                        effect.statuses = ["stunned"]
                    })
                    item.numberOfActivities = 3
                    item.addActivity(activity =>
                    {
                        activity.name = "Attack as Action"
                        activity.activationType = "action"
                        activity.attackBonus = "@mod"

                        activity.addConsumption(consumption =>
                        {
                            consumption.spellSlot = true
                            consumption.numberOfTargets = 2
                            consumption.addTarget(target =>
                            {
                                target.type = "activityUses"
                                target.value = "1"
                            })
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.bonus = "@mod"
                            damagePart.roll = "1d6"
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["slashing"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Attack as Bonus Action"
                        activity.activationType = "bonus"
                        activity.attackBonus = "@mod"

                        activity.addConsumption(consumption =>
                        {
                            consumption.spellSlot = true
                            consumption.numberOfTargets = 2
                            consumption.addTarget(target =>
                            {
                                target.type = "activityUses"
                                target.value = "1"
                            })
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.bonus = "@mod"
                            damagePart.roll = "1d6"
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["slashing"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Psychic Damage"
                        activity.activationType = "special"
                        activity.addConsumption(consumption =>
                        {
                            consumption.spellSlot = true
                            consumption.numberOfTargets = 2
                            consumption.addTarget(target =>
                            {
                                target.type = "activityUses"
                                target.value = "1"
                            })
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.bonus = "@mod"
                            damagePart.roll = "2d6"
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["psychic"]
                        })
                        activity.addEffect(effect =>
                        {
                            effect.name = "Stunned"
                            effect.statuses = ["stunned"]
                        })
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Dreams and Nightmares ability",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.items.find(i => i.name === "Dreams and Nightmares")
                )
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const transformationStage = actor.flags.transformations.stage
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Dreams and Nightmares"
                    item.type = "feat"
                    item.numberOfEffects = 1
                    item.uses.max = actorProf
                    item.uses.recovery.period = "lr"
                    item.uses.recovery.type = "recoverAll"
                    item.addEffect(effect =>
                    {
                        effect.name = "Dream or Nightmare"
                        effect.duration.turns = 10
                        effect.statuses = ["paralyzed"]
                    })
                    item.numberOfActivities = 2
                    item.addActivity(activity =>
                    {
                        activity.name = "Manipulate Mind"
                        activity.activationType = "bonus"
                        activity.type = "save"
                        activity.isConcentration = false

                        activity.addConsumption(consumption =>
                        {
                            consumption.spellSlot = true
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.range.units = "ft"
                        activity.range.values = 300
                        activity.saveDc = 8 + actorProf + transformationStage
                        activity.saveAbility = ["wis"]
                        activity.target.affects.count = 1
                        activity.target.affects.special = "Humanoid"
                        activity.target.affects.type = "creature"
                    })

                    item.addActivity(activity =>
                    {
                        activity.name = "Manipulate Mind (with concentration)"
                        activity.activationType = "bonus"
                        activity.type = "save"
                        activity.isConcentration = true

                        activity.addConsumption(consumption =>
                        {
                            consumption.spellSlot = true
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target =>
                            {
                                target.type = "itemUses"
                                target.value = "1"
                            })
                        })
                        activity.range.units = "ft"
                        activity.range.values = 300
                        activity.saveDc = 8 + actorProf + transformationStage
                        activity.saveAbility = ["wis"]
                        activity.target.affects.count = 1
                        activity.target.affects.special = "Humanoid"
                        activity.target.affects.type = "creature"
                    })

                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Weakend Constitution activity triggers message",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.items.find(i => i.name === "Weakend Constitution")
                )
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const transformationStage = actor.flags.transformations.stage
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Weakend Constitution"
                    item.type = "feat"
                    item.numberOfEffects = 0
                    item.uses.max = 1
                    item.uses.recovery.period = "initiative"
                    item.uses.recovery.type = "recoverAll"
                    item.numberOfActivities = 1
                    item.addActivity(activity =>
                    {
                        activity.name = "Fey Exhaustion Recovery"
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Weakend Constitution use of activity triggers chat message",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            steps: [

                async ({ actor, helpers }) =>
                {
                    await ChatMessage.deleteDocuments(
                        game.messages.contents.map(m => m.id)
                    )
                    const weakendConstitution = actor.items.find(i => i.name === "Weakend Constitution")
                    const activity = weakendConstitution.system.activities.find(a => a.name == "Fey Exhaustion Recovery")
                    activity.use()
                },
            ],

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    game.messages.contents.length > 0
                )
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const transformationStage = actor.flags.transformations.stage

                const messageDto = new MessageValidationDTO("base")
                messageDto.count = 1
                messageDto.contents.values = ["As a Magic action, you can expend a number of Hit Point Dice equal to your Transformation Stage to remove one level of Exhaustion gained in this manner. You gain no other benefit from those expended Hit Point Dice."]
                messageDto.contents.mode = "includes"
                messageDto.title = "Weakend Constitution - Fey Exhaustion Recovery"
                validate(messageDto, { assert })
            }
        },

        {
            name: "Weakend Constitution bloodied triggers constitution saving throw, sucess means no exhaustion levels",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            steps: [

                async ({ actor, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.saveResult = 20
                    globalThis.___TransformationTestEnvironment___.saveRolled = false
                },
            ],

            trigger: "bloodied",

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = 0
                validate(actorDto, { assert })
            }
        },

        {
            name: "Weakend Constitution bloodied triggers constitution saving throw, sucess means no exhaustion levels",

            requiredPath: [
                {
                    stage: 1,
                    choose: seasons.winter.servantUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: seasons.winter.magicTricksUuid,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.y7AmSHJfn7aMCUUs",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            steps: [

                async ({ actor, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.saveResult = 19
                    globalThis.___TransformationTestEnvironment___.saveRolled = false
                },
            ],

            trigger: "bloodied",

            await: async ({ actor, runtime, helpers, waiters }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion = 1
                validate(actorDto, { assert })
            }
        },
    ]
}