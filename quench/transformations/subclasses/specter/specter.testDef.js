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
const UNTETHERED_FROM_LIFE_UUID =
          "Compendium.transformations.gh-transformations.Item.rLi1CEdtteycxQmc"
const HAUNTING_FLIGHT_UUID =
          "Compendium.transformations.gh-transformations.Item.IwVCDClcKRjGrCy5"
const ETHEREAL_PHASING_UUID =
          "Compendium.transformations.gh-transformations.Item.XbL7I9z00L9jk555"
const BLINK_SPELL_UUID =
          "Compendium.transformations.gh-transformations.Item.uUPMmfL3Qa1Dic8Y"
const FRAYING_REALITY_UUID =
          "Compendium.transformations.gh-transformations.Item.daxJPuEvp9ATh0Lq"
const DRAINING_FLIGHT_UUID =
          "Compendium.transformations.gh-transformations.Item.reDuZAA1Mv6KFiz1"
const PARALYZING_TOUCH_UUID =
          "Compendium.transformations.gh-transformations.Item.kqUqRvNBuxkVNGNH"
const STAGE_1_GRANTED_ITEM_UUIDS = Object.freeze([
    SPECTRAL_FORM_UUID,
    DRAWN_TO_DARKNESS_UUID
])
const STAGE_2_GRANTED_ITEM_UUIDS = Object.freeze([
    ...STAGE_1_GRANTED_ITEM_UUIDS,
    UNTETHERED_FROM_LIFE_UUID
])
const STAGE_3_GRANTED_ITEM_UUIDS = Object.freeze([
    ...STAGE_2_GRANTED_ITEM_UUIDS,
    FRAYING_REALITY_UUID
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
    {
        name: "Ethereal Phasing",
        uuid: ETHEREAL_PHASING_UUID
    },
    {
        name: "Haunting Flight",
        uuid: HAUNTING_FLIGHT_UUID
    },
    {
        name: "Draining Flight",
        uuid: DRAINING_FLIGHT_UUID
    },
    {
        name: "Paralyzing Touch",
        uuid: PARALYZING_TOUCH_UUID
    },
    {name: "Specter Stage 4 Choice A", uuid: ""},
    {name: "Specter Stage 4 Choice B", uuid: ""}
])

function buildStagePath(choiceUuids = [])
{
    return choiceUuids.map((choiceUuid, index) => ({
        stage: index + 1,
        ...(choiceUuid ? {choose: choiceUuid} : {}),
        await: async ({runtime, actor, waiters}) =>
        {
            await waiters.waitForStageFinished(
                runtime,
                actor,
                waiters.waitForCondition,
                index + 1
            )
        }
    }))
}

async function waitForSpecterState({
    runtime,
    actor,
    waiters,
    expectedItemUuids = [],
    extraPredicate = null
})
{
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
            resistances.includes("necrotic") &&
            (typeof extraPredicate === "function"
                ? extraPredicate(actor)
                : true)
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
}

function addSpecterBaseAssertions(actorDto)
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

function addIncorporealMovementAssertions(actorDto, {
    actorProf
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [INCORPOREAL_MOVEMENT_UUID]
        item.itemName = "Incorporeal Movement"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
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
                    mode: 0,
                    value: "",
                    priority: 20
                },
                {
                    key: "system.traits.dr.value",
                    mode: 0,
                    value: "-force",
                    priority: 20
                }
            ]
        })
    })
}

function addGhastlyTouchAssertions(actorDto, {
    usesMax
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [GHASTLY_TOUCH_UUID]
        item.itemName = "Ghastly Touch"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.usesLeft = usesMax
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

function addUntetheredFromLifeAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [UNTETHERED_FROM_LIFE_UUID]
        item.itemName = "Untethered from Life"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Untethered from Life"
            effect.changes.count = 1
            effect.changes = [{
                key: "system.traits.da.healing",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "0.5",
                priority: 20
            }]
        })
    })
}

function addHauntingFlightAssertions(actorDto, {
    saveDc = 12
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [HAUNTING_FLIGHT_UUID]
        item.itemName = "Haunting Flight"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.usesLeft = 1
        item.numberOfActivities = 1
        item.numberOfEffects = 2
        item.addActivity(activity =>
        {
            activity.name = "Terrifying prescence"
            activity.activationType = "bonus"
            activity.range.value = 30
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.saveAbility = ["wis"]
            activity.saveDc = saveDc
            activity.addEffect(effect =>
            {
                effect.name = "Terrifying Prescense"
                effect.statuses = ["frightened"]
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Terrifying Prescense"
            effect.statuses = ["frightened"]
        })
        item.addEffect(effect =>
        {
            effect.name = "Haunting Flight"
            effect.changes.count = 1
            effect.changes = [{
                key: "system.attributes.movement.fly",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "@attributes.movement.walk",
                priority: 20
            }]
        })
    })
}

function addEtherealPhasingAssertions(actorDto, {
    stage
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [ETHEREAL_PHASING_UUID]
        item.itemName = "Ethereal Phasing"
        item.type = "feat"
        item.usesLeft = stage
        item.numberOfActivities = 2
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.prompt = false
            activity.healing.customEnabled = true
            activity.healing.custom = "@prof + @flags.transformations.stage"
            activity.healing.scalingNumber = 1
            activity.healing.numberOfTypes = 1
            activity.healing.types = ["temphp"]
        })
        item.addActivity(activity =>
        {
            activity.activationType = "action"
            activity.range.units = "self"
            activity.target.prompt = true
            activity.spellUuid = BLINK_SPELL_UUID
        })
        item.addAdvancement(advancement =>
        {
            advancement.addConfiguration(configuration =>
            {
                configuration.items = [BLINK_SPELL_UUID]
                configuration.spell.method = "spell"
                configuration.spell.prepared = 2
                configuration.spell.uses.max = ""
                configuration.spell.uses.per = ""
                configuration.spell.uses.requireSlot = true
            })
        })
    })
}

function addFrayingRealityAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [FRAYING_REALITY_UUID]
        item.itemName = "Fraying Reality"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.usesLeft = 1
        item.numberOfActivities = 1
        item.numberOfEffects = 1
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.saveAbility = ["cha"]
            activity.saveDc = 15
            activity.addEffect(effect =>
            {
                effect.name = "Confused"
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Confused"
            effect.duration.seconds = 60
        })
    })
}

function addDrainingFlightAssertions(actorDto, {
    saveDc = 14
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [DRAINING_FLIGHT_UUID]
        item.itemName = "Draining Flight"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.usesLeft = 1
        item.numberOfActivities = 1
        item.numberOfEffects = 2
        item.addActivity(activity =>
        {
            activity.name = "Spectral Damage"
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.saveAbility = ["con"]
            activity.saveDc = saveDc
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "6d6"
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["psychic"]
            })
            activity.addEffect(effect =>
            {
                effect.name = "Frightened"
                effect.statuses = ["frightened"]
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Draining Flight"
            effect.changes.count = 1
            effect.changes = [{
                key: "system.attributes.movement.fly",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: "@attributes.movement.walk",
                priority: 20
            }]
        })
        item.addEffect(effect =>
        {
            effect.name = "Frightened"
            effect.statuses = ["frightened"]
        })
    })
}

function addParalyzingTouchAssertions(actorDto, {
    stage,
    saveDc = 14
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [PARALYZING_TOUCH_UUID]
        item.itemName = "Paralyzing Touch"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "specter"
        item.usesLeft = stage
        item.numberOfActivities = 1
        item.numberOfEffects = 2
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.range.units = "spec"
            activity.range.special = "Creature damaged by Ghastly touch"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.saveAbility = ["con"]
            activity.saveDc = saveDc
            activity.addEffect(effect =>
            {
                effect.name = "Paralyzed"
                effect.statuses = ["paralyzed"]
            })
            activity.addEffect(effect =>
            {
                effect.name = "Prone"
                effect.statuses = ["prone"]
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Paralyzed"
            effect.statuses = ["paralyzed"]
        })
        item.addEffect(effect =>
        {
            effect.name = "Prone"
            effect.statuses = ["prone"]
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
            steps: buildStagePath([INCORPOREAL_MOVEMENT_UUID]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_1_GRANTED_ITEM_UUIDS,
                        INCORPOREAL_MOVEMENT_UUID
                    ]
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_1_GRANTED_ITEM_UUIDS,
                    INCORPOREAL_MOVEMENT_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addIncorporealMovementAssertions(actorDto, {actorProf})

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Ghastly Touch",
            steps: buildStagePath([GHASTLY_TOUCH_UUID]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_1_GRANTED_ITEM_UUIDS,
                        GHASTLY_TOUCH_UUID
                    ]
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_1_GRANTED_ITEM_UUIDS,
                    GHASTLY_TOUCH_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addGhastlyTouchAssertions(actorDto, {
                    usesMax: actorProf + 1
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Untethered from Life and Haunting Flight",
            steps: buildStagePath([
                INCORPOREAL_MOVEMENT_UUID,
                HAUNTING_FLIGHT_UUID
            ]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_2_GRANTED_ITEM_UUIDS,
                        INCORPOREAL_MOVEMENT_UUID,
                        HAUNTING_FLIGHT_UUID
                    ],
                    extraPredicate: actor =>
                        Number(actor.system?.traits?.da?.healing) === 0.5 &&
                        Number(actor.system?.attributes?.movement?.fly ?? 0) ===
                        Number(actor.system?.attributes?.movement?.walk ?? 0)
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof
                const stage = Number(
                    actor.flags?.transformations?.stage ?? 2
                )

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_2_GRANTED_ITEM_UUIDS,
                    INCORPOREAL_MOVEMENT_UUID,
                    HAUNTING_FLIGHT_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addIncorporealMovementAssertions(actorDto, {actorProf})
                addUntetheredFromLifeAssertions(actorDto)
                addHauntingFlightAssertions(actorDto, {
                    saveDc: actorProf + stage + 8
                })

                validate(actorDto, {assert})
                assert.strictEqual(
                    Number(actor.system?.traits?.da?.healing),
                    0.5,
                    "Untethered from Life should halve healing received"
                )
                assert.strictEqual(
                    Number(actor.system?.attributes?.movement?.fly ?? 0),
                    Number(actor.system?.attributes?.movement?.walk ?? 0),
                    "Haunting Flight should grant a fly speed equal to walk speed"
                )
            }
        },
        {
            name: "stage 2 with Ethereal Phasing",
            steps: buildStagePath([
                GHASTLY_TOUCH_UUID,
                ETHEREAL_PHASING_UUID
            ]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_2_GRANTED_ITEM_UUIDS,
                        GHASTLY_TOUCH_UUID,
                        ETHEREAL_PHASING_UUID,
                        BLINK_SPELL_UUID
                    ],
                    extraPredicate: actor =>
                        Number(actor.system?.traits?.da?.healing) === 0.5
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof
                const stage = Number(
                    actor.flags?.transformations?.stage ?? 2
                )

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_2_GRANTED_ITEM_UUIDS,
                    GHASTLY_TOUCH_UUID,
                    ETHEREAL_PHASING_UUID,
                    BLINK_SPELL_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addGhastlyTouchAssertions(actorDto, {
                    usesMax: actorProf + stage
                })
                addUntetheredFromLifeAssertions(actorDto)
                addEtherealPhasingAssertions(actorDto, {stage})

                validate(actorDto, {assert})
                assert.strictEqual(
                    Number(actor.system?.traits?.da?.healing),
                    0.5,
                    "Untethered from Life should halve healing received"
                )
            }
        },
        {
            name: "stage 3 with Fraying Reality and Draining Flight",
            steps: buildStagePath([
                INCORPOREAL_MOVEMENT_UUID,
                HAUNTING_FLIGHT_UUID,
                DRAINING_FLIGHT_UUID
            ]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_3_GRANTED_ITEM_UUIDS,
                        INCORPOREAL_MOVEMENT_UUID,
                        HAUNTING_FLIGHT_UUID,
                        DRAINING_FLIGHT_UUID
                    ],
                    extraPredicate: actor =>
                        Number(actor.system?.traits?.da?.healing) === 0.5 &&
                        Number(actor.system?.attributes?.movement?.fly ?? 0) ===
                        (Number(actor.system?.attributes?.movement?.walk ?? 0) * 2)
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof
                const stage = Number(
                    actor.flags?.transformations?.stage ?? 3
                )

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_3_GRANTED_ITEM_UUIDS,
                    INCORPOREAL_MOVEMENT_UUID,
                    HAUNTING_FLIGHT_UUID,
                    DRAINING_FLIGHT_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addIncorporealMovementAssertions(actorDto, {actorProf})
                addUntetheredFromLifeAssertions(actorDto)
                addHauntingFlightAssertions(actorDto, {
                    saveDc: actorProf + stage + 8
                })
                addFrayingRealityAssertions(actorDto)
                addDrainingFlightAssertions(actorDto, {
                    saveDc: actorProf + stage + 8
                })

                validate(actorDto, {assert})
                assert.strictEqual(
                    Number(actor.system?.traits?.da?.healing),
                    0.5,
                    "Untethered from Life should halve healing received"
                )
                assert.strictEqual(
                    Number(actor.system?.attributes?.movement?.fly ?? 0),
                    Number(actor.system?.attributes?.movement?.walk ?? 0) * 2,
                    "Draining Flight should stack with Haunting Flight to double fly speed"
                )
            }
        },
        {
            name: "stage 3 with Paralyzing Touch as the final available choice",
            steps: buildStagePath([
                GHASTLY_TOUCH_UUID,
                ETHEREAL_PHASING_UUID,
                null
            ]),
            finalAwait: async args =>
                waitForSpecterState({
                    ...args,
                    expectedItemUuids: [
                        ...STAGE_3_GRANTED_ITEM_UUIDS,
                        GHASTLY_TOUCH_UUID,
                        ETHEREAL_PHASING_UUID,
                        BLINK_SPELL_UUID,
                        PARALYZING_TOUCH_UUID
                    ],
                    extraPredicate: actor =>
                        Number(actor.system?.traits?.da?.healing) === 0.5
                }),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const actorProf = actor.system.attributes.prof
                const stage = Number(
                    actor.flags?.transformations?.stage ?? 3
                )

                actorDto.hasItemWithSourceUuids = [
                    ...STAGE_3_GRANTED_ITEM_UUIDS,
                    GHASTLY_TOUCH_UUID,
                    ETHEREAL_PHASING_UUID,
                    BLINK_SPELL_UUID,
                    PARALYZING_TOUCH_UUID
                ]
                addSpecterBaseAssertions(actorDto)
                addGhastlyTouchAssertions(actorDto, {
                    usesMax: actorProf + stage
                })
                addUntetheredFromLifeAssertions(actorDto)
                addEtherealPhasingAssertions(actorDto, {stage})
                addFrayingRealityAssertions(actorDto)
                addParalyzingTouchAssertions(actorDto, {
                    stage,
                    saveDc: actorProf + stage + 8
                })

                validate(actorDto, {assert})
                assert.strictEqual(
                    Number(actor.system?.traits?.da?.healing),
                    0.5,
                    "Untethered from Life should halve healing received"
                )
            }
        }
    ]
}
