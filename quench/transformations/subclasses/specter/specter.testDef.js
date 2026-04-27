import { ATTRIBUTE } from "../../../../config/constants.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const SPECTRAL_FORM_UUID =
          "Compendium.transformations.gh-transformations.Item.AAFvnzh8Y6gK8N2i"
const DRAWN_TO_DARKNESS_UUID =
          "Compendium.transformations.gh-transformations.Item.DwuZGkMkuXkYTFbI"
const INCORPOREAL_MOVEMENT_UUID =
          "Compendium.transformations.gh-transformations.Item.c22yc2mUwC93M0Ey"
const GHASTLY_TOUCH_UUID =
          "Compendium.transformations.gh-transformations.Item.TVXr6k6ItMlp8jPn"
const STAGE_1_GRANTED_ITEM_UUIDS = Object.freeze([
    SPECTRAL_FORM_UUID,
    DRAWN_TO_DARKNESS_UUID
])
const placeholderChoices = Object.freeze([
    {
        name: "Incorporeal Movement",
        uuid: INCORPOREAL_MOVEMENT_UUID
    },
    {
        name: "Ghastly Touch",
        uuid: GHASTLY_TOUCH_UUID
    },
    {name: "Specter Stage 2 Choice A", uuid: ""},
    {name: "Specter Stage 2 Choice B", uuid: ""},
    {name: "Specter Stage 3 Choice A", uuid: ""},
    {name: "Specter Stage 3 Choice B", uuid: ""},
    {name: "Specter Stage 4 Choice A", uuid: ""},
    {name: "Specter Stage 4 Choice B", uuid: ""}
])

async function waitForSpecterStage1State({
    runtime,
    actor,
    waiters,
    choiceUuid
})
{
    const expectedItemUuids = [
        ...STAGE_1_GRANTED_ITEM_UUIDS,
        choiceUuid
    ]

    await waiters.waitForCondition(() =>
    {
        const raceItem = actor.items.find(item => item.type === "race")
        const resistances = Array.from(actor.system?.traits?.dr?.value ?? [])

        return expectedItemUuids.every(uuid =>
                actor.items.some(item =>
                    item.flags?.transformations?.sourceUuid === uuid
                )
            ) &&
            raceItem?.system?.type?.value === "humanoid" &&
            raceItem?.system?.type?.subtype === "Undead" &&
            resistances.includes("necrotic")
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
}

function addStage1CommonAssertions(actorDto)
{
    actorDto.stats.resistances = ["necrotic"]
    actorDto.rollModes.disadvantage.push({
        identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
    })

    actorDto.addItem(item =>
    {
        item.type = "race"
        item.systemType = "humanoid"
        item.systemSubType = "Undead"
    })

    addSpectralFormAssertions(actorDto)
    addDrawnToDarknessAssertions(actorDto)
}

function addSpectralFormAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SPECTRAL_FORM_UUID]
        item.itemName = "Spectral Form"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.numberOfActivities = 0
        item.numberOfEffects = 0
        item.addAdvancement(advancement =>
        {
            advancement.addConfiguration(() => {})
        })
    })
}

function addDrawnToDarknessAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [DRAWN_TO_DARKNESS_UUID]
        item.itemName = "Drawn to Darkness"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Drawn to Darkness"
            effect.changes.count = 1
            effect.changes = [{
                key: "system.attributes.death.roll.mode",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "-1",
                priority: 20
            }]
        })
    })
}

function addIncorporealMovementAssertions(actorDto, actorProf)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [INCORPOREAL_MOVEMENT_UUID]
        item.itemName = "Incorporeal Movement"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.uses.max = actorProf
        item.usesLeft = actorProf
        item.numberOfActivities = 1
        item.numberOfEffects = 1
        item.addActivity(activity =>
        {
            activity.name = "Incorporeal form"
            activity.activationType = "action"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.addEffect(effect =>
            {
                effect.name = "Incorporeal Form"
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Incorporeal Form"
            effect.changes.count = 2
            effect.changes = [
                {
                    key: "system.traits.dr.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "",
                    priority: 20
                },
                {
                    key: "system.traits.dr.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
                    value: "-force",
                    priority: 20
                }
            ]
        })
    })
}

function addGhastlyTouchAssertions(actorDto, actorProf)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [GHASTLY_TOUCH_UUID]
        item.itemName = "Ghastly Touch"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.uses.max = actorProf + 1
        item.usesLeft = actorProf + 1
        item.numberOfActivities = 2
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "1d6"
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["necrotic"]
            })
        })
        item.addActivity(activity =>
        {
            activity.name = "Paralyzing touch extra damage"
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "1d6"
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["necrotic"]
            })
        })
    })
}

export const specterTestDef = {
    id: "specter",
    name: "Specter",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: [
        {
            name: "stage 1 with granted items and Incorporeal Movement",
            steps: [
                {
                    stage: 1,
                    choose: INCORPOREAL_MOVEMENT_UUID,
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
            finalAwait: async args =>
                waitForSpecterStage1State({
                    ...args,
                    choiceUuid: INCORPOREAL_MOVEMENT_UUID
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_1_GRANTED_ITEM_UUIDS,
                    INCORPOREAL_MOVEMENT_UUID
                ]
                addStage1CommonAssertions(actorDto)
                addIncorporealMovementAssertions(actorDto, actorProf)

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Ghastly Touch",
            steps: [
                {
                    stage: 1,
                    choose: GHASTLY_TOUCH_UUID,
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
            finalAwait: async args =>
                waitForSpecterStage1State({
                    ...args,
                    choiceUuid: GHASTLY_TOUCH_UUID
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_1_GRANTED_ITEM_UUIDS,
                    GHASTLY_TOUCH_UUID
                ]
                addStage1CommonAssertions(actorDto)
                addGhastlyTouchAssertions(actorDto, actorProf)

                validate(actorDto, {assert})
            }
        }
    ]
}
