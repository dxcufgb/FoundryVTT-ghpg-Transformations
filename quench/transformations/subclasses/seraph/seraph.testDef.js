import { ATTRIBUTE } from "../../../../config/constants.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const CELESTIAL_FORM_UUID =
          "Compendium.transformations.gh-transformations.Item.lPVIY7UVSXBCdK5K"
const PLANAR_BINDING_UUID =
          "Compendium.transformations.gh-transformations.Item.ZdNOjtoY9BtunP6Q"
const ANGELIC_WINGS_UUID =
          "Compendium.transformations.gh-transformations.Item.0JNmGyBDqHalcz3W"
const HOLY_STRIKES_UUID =
          "Compendium.transformations.gh-transformations.Item.ybOElBsdS36JW9E4"

async function waitForSeraphStage1State({
    runtime,
    actor,
    waiters,
    choiceUuid
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
    {
        const raceItem = actor.items.find(item => item.type === "race")

        return String(raceItem?.system?.type?.subtype ?? "").toLowerCase() ===
            "celestial" &&
            Array.from(actor.system?.traits?.dr?.value ?? []).includes("radiant") &&
            actor.system?.attributes?.death?.roll?.mode === -1 &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === CELESTIAL_FORM_UUID
            ) &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === PLANAR_BINDING_UUID
            ) &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === choiceUuid
            )
    })
}

function assertSeraphSubtype({actor, assert})
{
    const raceItem = actor.items.find(item => item.type === "race")

    assert.exists(raceItem, "Expected Seraph stage 1 to create a race item")
    assert.equal(
        String(raceItem.system?.type?.subtype ?? "").toLowerCase(),
        "celestial",
        "Expected Seraph stage 1 to set the race subtype to celestial"
    )
}

export const seraphTestDef = {
    id: "seraph",
    name: "Seraph",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: "stage 1 with Angelic Wings",
            steps: [
                {
                    stage: 1,
                    choose: ANGELIC_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage1State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: ANGELIC_WINGS_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    ANGELIC_WINGS_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [CELESTIAL_FORM_UUID]
                    item.itemName = "Celestial Form"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Celestial Form"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "radiant"
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [PLANAR_BINDING_UUID]
                    item.itemName = "Planar Binding"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Planar Binding"
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
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ANGELIC_WINGS_UUID]
                    item.itemName = "Angelic Wings"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 1
                    item.addActivity(activity =>
                    {
                        activity.name = "Manifest Wings"
                        activity.activationType = "bonus"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.addEffect(effect =>
                        {
                            effect.name = "Angelic Wings"
                            effect.duration.seconds = 3600
                            effect.changes.count = 2
                            effect.changes = [
                                {
                                    key: "system.attributes.movement.fly",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: "@attributes.movement.walk"
                                },
                                {
                                    key: "flags.transformations.seraph.angelicWings",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: "1"
                                }
                            ]
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Angelic Wings"
                        effect.duration.seconds = 3600
                        effect.changes.count = 2
                        effect.changes = [
                            {
                                key: "system.attributes.movement.fly",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "@attributes.movement.walk"
                            },
                            {
                                key: "flags.transformations.seraph.angelicWings",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "1"
                            }
                        ]
                    })
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 1 with Holy Strikes",
            steps: [
                {
                    stage: 1,
                    choose: HOLY_STRIKES_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage1State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: HOLY_STRIKES_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    HOLY_STRIKES_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [HOLY_STRIKES_UUID]
                    item.itemName = "Holy Strikes"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.range.units = "spec"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.uses.max = actorProf + 1
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.critical.allow = true
                        activity.critical.bonus = ""
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.customEnabled = true
                            damagePart.custom = "(@flags.transformations.stage)d6"
                            damagePart.bonus = ""
                            damagePart.scalingNumber = 1
                            damagePart.numberOfTypes = 0
                        })
                    })
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        }
    ]
}
