import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"
import { RollService } from "../../../../services/rolls/RollService.js"
import { Vampire } from "../../../../domain/transformation/subclasses/vampire/Vampire.js"
import { TRUE_APPEARANCE_EFFECT_NAME, TRUE_APPEARANCE_SAVE_ACTIVITY_NAME, TRUE_APPEARANCE_SAVE_ITEM_UUID } from "../../../../domain/transformation/subclasses/vampire/triggers/trueAppearanceTriggerCommon.js"

const THE_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.Zd5sRelguKUDcoAP"
const GREATER_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.ZCqnYQJ2nFR8AWQq"
const FANGED_BITE_UUID =
          "Compendium.transformations.gh-transformations.Item.TreKDUe7BregxPRU"
const FZEG_CLAW_UUID =
          "Compendium.transformations.gh-transformations.Item.0ZgPuhqfVv3Nk0x4"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID = "ddjFKkSGslAQQjB4"
const SANGROMANCY_SPECIALIST_UUID =
          "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"
const SANGROMANCY_SPECIALIST_ACTIVITY_NAME = "Enhance Cantrip Damage"
const TRUE_APPEARANCE_HIDE_ACTIVITY_NAME = "Hide True Appearance"
const STAGE3_MAXIMUM_DAYS_PER_FEED = 2
const STAGE1_MAXIMUM_DAYS_PER_FEED = 7
const STAGE2_MAXIMUM_DAYS_PER_FEED = 4
const ABILITY_KEYS = Object.freeze([
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
])

const stage1Choices = Object.freeze([
    {
        name: "Strigoi Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        img: "modules/transformations/Icons/Transformations/Vampire/Strigoi%20Bloodline.png",
        identifier: "strigoi-bloodline",
        descriptionSnippet:
            "You can take the Hide action as a Bonus Action",
        advancementCount: 2,
        effectCount: 0,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 12
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.skills?.ste?.proficient ?? 0) === 1
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.dex.value = 12
            actorDto.skills.ste.proficient = 1
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 2
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 0,
                        dex: 2,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addAdvancement(advancement =>
            {
                advancement.type = "Trait"
                advancement.addConfiguration(configuration =>
                {
                    configuration.allowReplacements = false
                    configuration.grants = ["skills:ste"]
                    configuration.mode = "upgrade"
                })
            })
        }
    },
    {
        name: "Soman Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu",
        img: "modules/transformations/Icons/Transformations/Vampire/Soman%20Bloodline.png",
        identifier: "soman-bloodline",
        descriptionSnippet: "You gain a Climb Speed equal to your Speed",
        advancementCount: 1,
        effectCount: 1,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 11
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.value ?? 0) === 11
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.movement?.climb ?? 0) ===
                Number(actor.system?.attributes?.movement?.walk ?? 0)
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 11
            actorDto.abilities.dex.value = 11
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 1
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 19
                    configuration.fixed = {
                        str: 1,
                        dex: 1,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addEffect(effect =>
            {
                effect.name = "Soman Bloodline"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.movement.climb",
                        mode: 2,
                        value: "@attributes.movement.walk",
                        priority: 20
                    }
                ]
            })
        }
    },
    {
        name: "Fzeg Bloodline",
        uuid: "Compendium.transformations.gh-transformations.Item.1WKmzJQpwJ3MO0uc",
        img: "modules/transformations/Icons/Transformations/Vampire/Fzeg%20Bloodline.png",
        identifier: "fzeg-bloodline",
        descriptionSnippet: "You gain a Claw attack",
        advancementCount: 2,
        effectCount: 1,
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.str?.value ?? 0) === 12
            )
            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.movement?.walk ?? 0) === 40
            )
            await waiters.waitForCondition(() =>
                Boolean(getItemBySourceUuid(actor, FZEG_CLAW_UUID))
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.str.value = 12
            actorDto.hasItemWithSourceUuids.push(FZEG_CLAW_UUID)
        },
        configureBloodlineItemValidation: item =>
        {
            item.numberOfAdvancements = 2
            item.addAdvancement(advancement =>
            {
                advancement.type = "AbilityScoreImprovement"
                advancement.addConfiguration(configuration =>
                {
                    configuration.cap = 1
                    configuration.points = 0
                    configuration.max = 20
                    configuration.fixed = {
                        str: 2,
                        dex: 0,
                        con: 0,
                        int: 0,
                        wis: 0,
                        cha: 0
                    }
                    configuration.locked = ABILITY_KEYS
                })
            })
            item.addAdvancement(advancement => {
                advancement.type = "ItemGrant"
                advancement.addConfiguration(configuration =>
                {
                    configuration.items = [FZEG_CLAW_UUID]
                    configuration.optional = false
                })
            })
            item.addEffect(effect =>
            {
                effect.name = "Fzeg Bloodline"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.movement.walk",
                        mode: 2,
                        value: "+10",
                        priority: 20
                    }
                ]
            })
        }
    }
])

const DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE = stage1Choices[0]

const stage2Choices = Object.freeze([
    {
        name: "Eyes of the Night",
        uuid: "Compendium.transformations.gh-transformations.Item.3JGiaLxVh3KNd8Br",
        img: "modules/transformations/Icons/Transformations/Vampire/Eyes%20of%20the%20Night.png",
        identifier: "eyes-of-the-night",
        descriptionSnippet: "You gain Darkvision out to 60 feet",
        advancementCount: 0,
        activityCount: 0,
        effectCount: 1,
        usesMax: "",
        finalAwait: async ({actor, waiters, staticVars}) =>
        {
            const expectedDarkvision =
                      Number(staticVars.initialDarkvision ?? 0) + 60

            await waiters.waitForCondition(() =>
                Number(actor.system?.attributes?.senses?.darkvision ?? 0) ===
                expectedDarkvision
            )
        },
        configureAppliedActorValidation: (actorDto, {staticVars}) =>
        {
            actorDto.stats.darkvision =
                Number(staticVars.initialDarkvision ?? 0) + 60
        },
        configureChoiceItemValidation: item =>
        {
            item.addEffect(effect =>
            {
                effect.name = "Eyes of the Night"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.attributes.senses.darkvision",
                        mode: 2,
                        value: "+60",
                        priority: 20,
                        fieldName: "Senses (Darkvision)",
                        fieldDescription: ""
                    }
                ]
            })
        }
    },
    {
        name: "Grave-Touched Soul",
        uuid: "Compendium.transformations.gh-transformations.Item.G8cE7iKgR6oa9yYe",
        img: "modules/transformations/Icons/Transformations/Vampire/Grave-Touched%20Soul.png",
        identifier: "grave-touched-soul",
        descriptionSnippet: "You gain Resistance to Necrotic damage",
        advancementCount: 1,
        activityCount: 0,
        effectCount: 0,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Array.from(actor.system?.traits?.dr?.value ?? [])
                .includes("necrotic")
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.stats.resistances = ["necrotic"]
        },
        configureChoiceItemValidation: item =>
        {
            item.addAdvancement(advancement =>
            {
                advancement.type = "Trait"
                advancement.addConfiguration(configuration =>
                {
                    configuration.allowReplacements = false
                    configuration.grants = ["dr:necrotic"]
                    configuration.mode = "default"
                })
            })
        }
    },
    {
        name: "Inhuman Reflexes",
        uuid: "Compendium.transformations.gh-transformations.Item.rviGB0iP3bPoH6dZ",
        img: "modules/transformations/Icons/Transformations/Vampire/inhuman%20Reflexes.png",
        identifier: "inhuman-reflexes",
        descriptionSnippet: "You have Advantage on Dexterity saving throws",
        advancementCount: 0,
        activityCount: 0,
        effectCount: 1,
        usesMax: "",
        finalAwait: async ({actor, waiters}) =>
        {
            await waiters.waitForCondition(() =>
                Number(actor.system?.abilities?.dex?.save?.roll?.mode ?? 0) === 1
            )
        },
        configureAppliedActorValidation: actorDto =>
        {
            actorDto.abilities.dex.save.roll.mode = 1
        },
        configureChoiceItemValidation: item =>
        {
            item.addEffect(effect =>
            {
                effect.name = "Inhuman Reflexes"
                effect.transfer = true
                effect.changes.count = 1
                effect.changes = [
                    {
                        key: "system.abilities.dex.save.roll.mode",
                        mode: 2,
                        value: "+1",
                        priority: 20,
                        fieldName: "DND5E AdvantageMode",
                        fieldDescription: ""
                    }
                ]
            })
        }
    },
    {
        name: "Undead Resilience",
        uuid: "Compendium.transformations.gh-transformations.Item.E4IbeEVR4pGBOCIw",
        img: "modules/transformations/Icons/Transformations/Vampire/Undead%20Resilience.png",
        identifier: "undead-resilience",
        descriptionSnippet:
            "you cannot use it again until you finish a Long Rest",
        advancementCount: 0,
        activityCount: 1,
        effectCount: 0,
        usesMax: "1",
        finalAwait: async () => {},
        configureAppliedActorValidation: () => {},
        configureChoiceItemValidation: item =>
        {
            item.addActivity(activity =>
            {
                activity.id = "PKnfExKlJ20Rt4Kx"
                activity.type = "heal"
                activity.activationType = "special"
                activity.duration.units = "inst"
                activity.duration.concentration = false
                activity.range.units = "self"
                activity.target.affects.type = "self"
                activity.target.prompt = true
                activity.consumption.numberOfTargets = 1
                activity.addConsumptionTarget(target =>
                {
                    target.target = ""
                    target.type = "itemUses"
                    target.value = "1"
                })
                activity.uses.max = ""
                activity.healing.customEnabled = true
                activity.healing.custom = "1"
                activity.healing.scalingNumber = 1
                activity.healing.types = ["healing"]
                activity.healing.numberOfTypes = 1
                activity.healing.bonus = ""
            })
        }
    }
])

const stage2ChoicePairs = Object.freeze(
    createStage2ChoicePairs(stage2Choices)
)
const DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES = Object.freeze([
    stage2Choices[0].uuid,
    stage2Choices[2].uuid
])
const DEFAULT_TRUE_APPEARANCE_STAGE3_CHOICE_UUIDS = Object.freeze([
    "Compendium.transformations.gh-transformations.Item.zqHnVx3qp8v5MqM6",
    "Compendium.transformations.gh-transformations.Item.85DUuTRth5jW8GG2"
])
const DEFAULT_STAGE3_CHOICE_UUIDS = Object.freeze([
    SANGROMANCY_SPECIALIST_UUID,
    "Compendium.transformations.gh-transformations.Item.zqHnVx3qp8v5MqM6"
])

const fangedBiteBehaviorCases = Object.freeze([
    {
        name: "Strigoi Bloodline with attack-roll advantage upgrades Midi Attack damage",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: true,
        expectedFormula: "2d4 + 1"
    },
    {
        name: "Strigoi Bloodline upgrades Midi Attack damage when advantage is selected in the attack workflow",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: false,
        damageWorkflowAdvantage: true,
        expectedFormula: "2d4 + 1"
    },
    {
        name: "Strigoi Bloodline without advantage keeps Midi Attack damage unchanged",
        stage1ChoiceName: "Strigoi Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7",
        attackHasAdvantage: false,
        expectedFormula: "1d6 + 1"
    },
    {
        name: "Soman Bloodline with advantage keeps Midi Attack damage unchanged",
        stage1ChoiceName: "Soman Bloodline",
        stage1ChoiceUuid:
            "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu",
        attackHasAdvantage: true,
        expectedFormula: "1d6 + 1"
    }
])

const sangromancyResourceBehaviorCases = Object.freeze([
    {
        name: "Sangromancy Specialist consumes item charges before class hit dice",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 2
            }
        ],
        charges: 2,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "2d6",
        expectedUsesSpent: 2,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 2
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist item charges roll using the actor's highest class hit die denomination",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 2
            },
            {
                className: "Fighter",
                levels: 1,
                hitDiceValue: 0
            }
        ],
        charges: 2,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "2d10",
        expectedUsesSpent: 2,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 2
            },
            {
                className: "Fighter",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist spends class hit dice from the highest denomination first after charges are depleted",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 1
            },
            {
                className: "Fighter",
                levels: 1,
                hitDiceValue: 1
            }
        ],
        charges: 0,
        rollButtonText: "Roll 2 Dice",
        expectedFormula: "1d10 + 1d6",
        expectedUsesSpent: 0,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 0
            },
            {
                className: "Fighter",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die",
            "Roll 2 Dice"
        ],
        expectedAbsentButtons: [
            "Roll 3 Dice"
        ]
    },
    {
        name: "Sangromancy Specialist respects the total available resource pool",
        classDefinitions: [
            {
                className: "Wizard",
                levels: 4,
                hitDiceValue: 0
            }
        ],
        charges: 1,
        rollButtonText: "Roll 1 Die",
        expectedFormula: "1d6",
        expectedUsesSpent: 1,
        expectedClassStates: [
            {
                className: "Wizard",
                remainingHitDice: 0
            }
        ],
        expectedPresentButtons: [
            "Roll 1 Die"
        ],
        expectedAbsentButtons: [
            "Roll 2 Dice",
            "Roll 3 Dice"
        ]
    }
])

const trueAppearanceAutoTriggerCases = Object.freeze([
    {
        name: "True Appearance bloodied trigger uses Midi Save",
        trigger: "bloodied"
    },
    {
        name: "True Appearance concentration trigger uses Midi Save",
        trigger: "concentration"
    },
    {
        name: "True Appearance unconscious trigger uses Midi Save",
        trigger: "unconscious"
    }
])

const placeholderChoices = Object.freeze([
    ...stage1Choices,
    ...stage2Choices,
    {name: "Vampire Stage 3 Choice A", uuid: ""},
    {name: "Vampire Stage 3 Choice B", uuid: ""},
    {name: "Vampire Stage 4 Choice A", uuid: ""},
    {name: "Vampire Stage 4 Choice B", uuid: ""}
])

function createStage2ChoicePairs(choices)
{
    const pairs = []

    for (let index = 0; index < choices.length; index++) {
        for (
            let comparisonIndex = index + 1;
            comparisonIndex < choices.length;
            comparisonIndex++
        )
        {
            const firstChoice = choices[index]
            const secondChoice = choices[comparisonIndex]

            pairs.push({
                name: `${firstChoice.name} and ${secondChoice.name}`,
                uuids: [firstChoice.uuid, secondChoice.uuid],
                choices: [firstChoice, secondChoice]
            })
        }
    }

    return pairs
}

function resolveCurrentActor(actor)
{
    return game?.actors?.get?.(actor?.id) ?? actor
}

function getItemBySourceUuid(actor, sourceUuid)
{
    const currentActor = resolveCurrentActor(actor)

    return currentActor?.items?.find?.(item =>
        item.flags?.transformations?.sourceUuid === sourceUuid
    ) ?? null
}

function getAbilityScoreAdvancementDialogElement()
{
    const dialogApplication = Array.from(
        ui?.windows?.values?.() ?? []
    ).find(window =>
        window?.constructor?.name === "AbilityScoreAdvancementDialog"
    )

    return dialogApplication?.element ??
        document.querySelector(".ability-score-advancement-dialog") ??
        document.querySelector(".ability-score-advancement")
}

async function waitForAppliedStageWithoutAbilityScoreDialog({
    runtime,
    actor,
    waiters,
    stage,
    sourceName
})
{
    await waiters.waitForNextFrame()

    const openedDialog = getAbilityScoreAdvancementDialogElement()
    if (openedDialog) {
        throw new Error(
            `${sourceName} ability score dialog opened unexpectedly`
        )
    }

    await waiters.waitForStageFinished(
        runtime,
        actor,
        waiters.waitForCondition,
        stage
    )

    const remainingDialog = getAbilityScoreAdvancementDialogElement()
    if (remainingDialog) {
        throw new Error(
            `${sourceName} ability score dialog opened unexpectedly`
        )
    }
}

function getItemActivities(item)
{
    const activities = item?.system?.activities

    if (!activities) return []

    if (Array.isArray(activities)) {
        return activities.filter(Boolean)
    }

    if (Array.isArray(activities?.contents)) {
        return activities.contents.filter(Boolean)
    }

    if (typeof activities?.values === "function") {
        return Array.from(activities.values()).filter(Boolean)
    }

    if (typeof activities?.[Symbol.iterator] === "function") {
        return Array.from(activities).filter(Boolean)
    }

    return Object.values(activities).filter(Boolean)
}

function getMainFangedBiteActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.id === FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID ||
        activity?._id === FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID ||
        activity?.name === "Midi Attack" ||
        activity?.macroData?.name === "Midi Attack"
    ) ?? null
}

function getSangromancySpecialistActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.name === SANGROMANCY_SPECIALIST_ACTIVITY_NAME
    ) ?? null
}

function getTrueAppearanceItem(actor)
{
    return getItemBySourceUuid(actor, TRUE_APPEARANCE_SAVE_ITEM_UUID)
}

function getTrueAppearanceSaveActivity(item)
{
    return getItemActivities(item).find(activity =>
        activity?.name === TRUE_APPEARANCE_SAVE_ACTIVITY_NAME
    ) ?? null
}

function getTrueAppearanceHideActivity(item)
{
    return getItemActivities(item).find(activity =>
        normalizeText(activity?.name) ===
        normalizeText(TRUE_APPEARANCE_HIDE_ACTIVITY_NAME)
    ) ?? null
}

async function createHidingTrueAppearanceEffect(actor)
{
    const currentActor = resolveCurrentActor(actor)
    if (!currentActor) {
        return
    }

    if (currentActor.effects.some(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    ))
    {
        return
    }

    await currentActor.createEmbeddedDocuments("ActiveEffect", [
        {
            name: TRUE_APPEARANCE_EFFECT_NAME,
            disabled: false
        }
    ])
}

async function tryCreateHidingTrueAppearanceEffectFromActivity({
    actor,
    runtime,
    waiters
})
{
    const currentActor = resolveCurrentActor(actor)
    if (!currentActor) {
        return false
    }

    const trueAppearanceItem = getTrueAppearanceItem(currentActor)
    const hideActivity = getTrueAppearanceHideActivity(trueAppearanceItem)

    if (!hideActivity || typeof hideActivity.use !== "function") {
        return false
    }

    await hideActivity.use()

    if (runtime && waiters) {
        await waiters.waitForDomainStability({
            actor: currentActor,
            asyncTrackers: runtime.dependencies.utils.asyncTrackers
        })
        await waiters.waitForNextFrame()
    }

    return resolveCurrentActor(actor).effects.some(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    )
}

async function ensureHidingTrueAppearanceEffect({
    actor,
    runtime,
    waiters
})
{
    const currentActor = resolveCurrentActor(actor)
    if (currentActor?.effects?.some?.(effect =>
        effect.name === TRUE_APPEARANCE_EFFECT_NAME
    ))
    {
        return currentActor
    }

    const wasCreatedByActivity =
              await tryCreateHidingTrueAppearanceEffectFromActivity({
                  actor,
                  runtime,
                  waiters
              })

    if (!wasCreatedByActivity) {
        await createHidingTrueAppearanceEffect(actor)
    }

    if (runtime && waiters) {
        await waitForHidingTrueAppearanceState({
            actor,
            runtime,
            waiters,
            present: true
        })
    }

    return resolveCurrentActor(actor)
}

async function waitForHidingTrueAppearanceState({
    actor,
    runtime,
    waiters,
    present
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
    {
        const currentActor = resolveCurrentActor(actor)

        return currentActor.effects.some(effect =>
            effect.name === TRUE_APPEARANCE_EFFECT_NAME
        ) === present
    })
}

function assertHidingTrueAppearanceState({
    actor,
    assert,
    present
})
{
    const actorDto = new ActorValidationDTO(resolveCurrentActor(actor))

    if (present) {
        actorDto.effects.has.push(TRUE_APPEARANCE_EFFECT_NAME)
    } else {
        actorDto.effects.notHas.push(TRUE_APPEARANCE_EFFECT_NAME)
    }

    validate(actorDto, {assert})
}

function normalizeText(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

async function createCharacterClassWithHitDice({
    actor,
    helpers,
    className,
    hitDiceValue,
    hitDiceMax = null,
    levels = 1
})
{
    const resolvedHitDiceMax = hitDiceMax == null
        ? Math.max(hitDiceValue, levels)
        : hitDiceMax
    const sourceClass = await helpers.getCharacterClass(className)
    const classItem = await helpers.createActorItemAndWait(
        actor,
        sourceClass,
        {
            setTransformationFlags: false,
            setDdbImporterFlag: false,
            applyAdvancements: false,
            levels
        }
    )

    await classItem.update({
        "system.hd.value": hitDiceValue,
        "system.hd.max": resolvedHitDiceMax,
        "system.hd.spent": Math.max(resolvedHitDiceMax - hitDiceValue, 0)
    })

    return actor.items.get(classItem.id) ?? classItem
}

async function configureSangromancySpecialistCharges({
    actor,
    item,
    charges
})
{
    await actor.setFlag(
        "transformations",
        "vampire.sangromancyHitDieMax",
        charges
    )

    await item.update({
        "system.uses.max": charges,
        "system.uses.value": charges,
        "system.uses.spent": 0
    })
}

async function prepareSangromancySpecialistChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars,
    loopVars
})
{
    staticVars.sangromancySpecialist = getItemBySourceUuid(
        actor,
        SANGROMANCY_SPECIALIST_UUID
    )

    if (!staticVars.sangromancySpecialist) {
        throw new Error("Sangromancy Specialist item not present on actor")
    }

    await configureSangromancySpecialistCharges({
        actor,
        item: staticVars.sangromancySpecialist,
        charges: loopVars.charges
    })

    staticVars.sangromancyActivity = getSangromancySpecialistActivity(
        staticVars.sangromancySpecialist
    )

    if (!staticVars.sangromancyActivity) {
        throw new Error(
            "Enhance Cantrip Damage activity not present on Sangromancy Specialist"
        )
    }

    staticVars.initialMessageIds = new Set(
        game.messages.contents.map(message => message.id)
    )

    const activityUseResult = await staticVars.sangromancyActivity.use({actor})

    await waiters.waitForCondition(() =>
        game.messages.get(
            activityUseResult?.message?.id ??
            activityUseResult?.chatMessage?.id ??
            activityUseResult?.changes?.message?.id ??
            ""
        ) != null ||
        game.messages.contents.some(message =>
            !staticVars.initialMessageIds.has(message.id)
        )
    )

    staticVars.message =
        game.messages.get(
            activityUseResult?.message?.id ??
            activityUseResult?.chatMessage?.id ??
            activityUseResult?.changes?.message?.id ??
            ""
        ) ??
        game.messages.contents.find(message =>
            !staticVars.initialMessageIds.has(message.id)
        ) ??
        game.messages.contents.at(-1)

    if (!staticVars.message) {
        throw new Error("Enhance Cantrip Damage activity did not create a chat message")
    }

    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })
}

async function bindSangromancySpecialistCard({
    actor,
    runtime,
    message
})
{
    const currentMessage = game.messages.get(message?.id) ?? message ?? null
    const html = document.createElement("div")
    html.innerHTML = currentMessage?.content ?? ""

    const transformation =
              runtime.services.transformationRegistry.getEntryForActor(actor)

    await transformation?.TransformationClass?.onRenderChatMessage?.({
        message: currentMessage,
        html,
        actor,
        actorRepository: runtime.infrastructure.actorRepository,
        itemRepository: runtime.infrastructure.itemRepository,
        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
        RollService
    })

    return html
}

async function clickSangromancySpecialistCardButton({
    actor,
    runtime,
    message,
    waiters,
    text
})
{
    const html = await bindSangromancySpecialistCard({
        actor,
        runtime,
        message
    })
    const button = Array.from(
        html.querySelectorAll("button")
    ).find(candidate =>
        normalizeText(candidate.textContent) === normalizeText(text)
    )

    if (!button) {
        throw new Error(
            `Sangromancy Specialist chat card button not found with text "${text}"`
        )
    }

    button.click()
    await waiters.waitForNextFrame()
}

function createVampireActorValidationDTO(
    actor,
    requiredSourceUuids = [],
    maximumDaysPerFeed  = STAGE1_MAXIMUM_DAYS_PER_FEED
)
{
    const actorDto = new ActorValidationDTO(actor)

    actorDto.hasItemWithSourceUuids = [...requiredSourceUuids]
    actorDto.flags.match.push({
        path: "transformations.vampire",
        expected: {
            maximumDaysPerFeed
        }
    })

    return actorDto
}

function expectUsesMaxMatchesVampireFeedWindow(expect, usesMax)
{
    expect(
        [
            "@flags.transformations.vampire.maximumDaysPerFeed",
            String(STAGE1_MAXIMUM_DAYS_PER_FEED),
            STAGE1_MAXIMUM_DAYS_PER_FEED
        ].includes(usesMax),
        `Unexpected uses.max value: ${usesMax}`
    ).to.equal(true)
}

function captureVampireStage2InitialState(actor, staticVars)
{
    staticVars.initialDarkvision =
        Number(actor.system?.attributes?.senses?.darkvision ?? 0)
}

function addTheSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [THE_SANGUINE_CURSE_UUID]
        item.itemName = "The Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/The%20Sanguine%20Curse.png"
        item.identifier = "the-sanguine-curse"
        item.descriptionIncludes =
            "You must feed at least once within seven days"
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.name = "Feed"
            activity.type = "utility"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "ft"
            activity.range.value = "5"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 1
            activity.addConsumptionTarget(target =>
            {
                target.target = ""
                target.type = "itemUses"
                target.value = "-7"
            })
            activity.uses.max = ""
        })
    })
}

function addFangedBiteValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [FANGED_BITE_UUID]
        item.itemName = "Fanged Bite"
        item.type = "weapon"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Fanged%20Bite.png"
        item.identifier = "fanged-bite"
        item.descriptionIncludes =
            "If the attack hits a creature that has blood"
        item.systemType = "natural"
        item.equipped = true
        item.proficient = 1
        item.propertiesIncludes = ["fin"]
        item.numberOfAdvancements = 0
        item.numberOfActivities = 3
        item.numberOfEffects = 0
        item.range.units = "ft"
        item.range.value = 5
        item.range.reach = 5
        item.range.long = 5
        item.uses.max = ""
        item.flags.match.push({
            path: "midi-qol",
            expected: {
                onUseMacroName:
                    "[preAttackRollConfig]ItemMacro,[postDamageRoll]ActivityMacro-ddjFKkSGslAQQjB4"
            }
        })
        item.flags.match.push({
            path: "dae.macro",
            expected: {
                name: "Fanged Bite"
            }
        })
        item.addDamagePart("base", damagePart =>
        {
            damagePart.roll = "1d6"
            damagePart.bonus = "@mod"
            damagePart.damageTypes = ["piercing"]
        })
        item.addActivity(activity =>
        {
            activity.id = FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID
            activity.type = "attack"
            activity.activationType = "action"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 0
            activity.attackType = "melee"
            activity.attackFlat = false
            activity.attackMode = "oneHanded"
            activity.attackRollPerTarget = "default"
            activity.triggeredActivityRollAs = "firstTarget"
            activity.macroName = "Midi Attack"
            activity.damageIncludeBase = true
            activity.uses.max = ""
        })
        item.addActivity(activity =>
        {
            activity.name = "Necrotic Save"
            activity.type = "save"
            activity.activationType = "special"
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.saveAbility = ["con"]
            activity.saveDcFormula =
                "8 + @prof + @flags.transformations.stage"
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "1d6"
                damagePart.damageTypes = ["necrotic"]
            })
        })
        item.addActivity(activity =>
        {
            activity.name = "Necrotic Save (Soman)"
            activity.type = "save"
            activity.activationType = "special"
            activity.range.units = "ft"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.saveAbility = ["con"]
            activity.saveDcFormula =
                "8 + @prof + @flags.transformations.stage"
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "1d8"
                damagePart.damageTypes = ["necrotic"]
            })
        })
    })
}

function addSangromancySpecialistValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SANGROMANCY_SPECIALIST_UUID]
        item.itemName = "Sangromancy Specialist"
        item.addActivity(activity =>
        {
            activity.name = SANGROMANCY_SPECIALIST_ACTIVITY_NAME
            activity.type = "utility"
            activity.activationType = "special"
            activity.duration.units = "inst"
            activity.duration.concentration = false
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.consumption.numberOfTargets = 0
            activity.uses.max = ""
        })
    })
}

function addGreaterSanguineCurseValidation(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [GREATER_SANGUINE_CURSE_UUID]
        item.itemName = "Greater Sanguine Curse"
        item.type = "feat"
        item.img =
            "modules/transformations/Icons/Transformations/Vampire/Greater%20Sanguine%20Curse.png"
        item.identifier = "greater-sanguine-curse"
        item.descriptionIncludes = "You must feed every 4 days"
        item.systemType = ""
        item.systemSubType = ""
        item.numberOfAdvancements = 0
        item.numberOfActivities = 0
        item.numberOfEffects = 0
        item.uses.max = ""
    })
}

function addStage1ChoiceItemValidation(actorDto, loopVars)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [loopVars.uuid]
        item.itemName = loopVars.name
        item.type = "feat"
        item.img = loopVars.img
        item.identifier = loopVars.identifier
        item.descriptionIncludes = loopVars.descriptionSnippet
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = loopVars.advancementCount
        item.numberOfActivities = 0
        item.numberOfEffects = loopVars.effectCount
        item.uses.max = ""

        loopVars.configureBloodlineItemValidation(item)
    })
}

function addStage2ChoiceItemValidation(actorDto, choice)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [choice.uuid]
        item.itemName = choice.name
        item.type = "feat"
        item.img = choice.img
        item.identifier = choice.identifier
        item.descriptionIncludes = choice.descriptionSnippet
        item.systemType = "transformation"
        item.systemSubType = "vampire"
        item.propertiesIncludes = ["trait"]
        item.numberOfAdvancements = choice.advancementCount
        item.numberOfActivities = choice.activityCount
        item.numberOfEffects = choice.effectCount
        item.uses.max = choice.usesMax

        choice.configureChoiceItemValidation(item)
    })
}

function addStage2ChoicePairItemValidations(actorDto, loopVars)
{
    loopVars.choices.forEach(choice =>
    {
        addStage2ChoiceItemValidation(actorDto, choice)
    })
}

function buildVampireStage1BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        THE_SANGUINE_CURSE_UUID,
        FANGED_BITE_UUID,
        loopVars.uuid
    ], STAGE1_MAXIMUM_DAYS_PER_FEED)

    addTheSanguineCurseValidation(actorDto)
    addFangedBiteValidation(actorDto)
    addStage1ChoiceItemValidation(actorDto, loopVars)

    return actorDto
}

function buildVampireStage1AppliedActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        loopVars.uuid
    ], STAGE1_MAXIMUM_DAYS_PER_FEED)

    addStage1ChoiceItemValidation(actorDto, loopVars)
    loopVars.configureAppliedActorValidation(actorDto)

    return actorDto
}

function buildVampireStage2BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        GREATER_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE2_MAXIMUM_DAYS_PER_FEED)

    addGreaterSanguineCurseValidation(actorDto)
    addStage2ChoicePairItemValidations(actorDto, loopVars)

    return actorDto
}

function buildVampireStage2AppliedActorValidationDTO(
    actor,
    loopVars,
    staticVars
)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        GREATER_SANGUINE_CURSE_UUID,
        ...loopVars.uuids
    ], STAGE2_MAXIMUM_DAYS_PER_FEED)

    addGreaterSanguineCurseValidation(actorDto)
    addStage2ChoicePairItemValidations(actorDto, loopVars)

    loopVars.choices.forEach(choice =>
    {
        choice.configureAppliedActorValidation(actorDto, {staticVars})
    })

    return actorDto
}

function configureFixedVampireAbilityScoreAdvancement(itemName)
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: itemName,
            choice: {}
        }
    ]
}

function buildSangromancySpecialistRequiredPath()
{
    return [
        {
            stage: 1,
            choose: DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid
        },
        {
            stage: 2,
            choose: DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES
        },
        {
            stage: 3,
            choose: DEFAULT_STAGE3_CHOICE_UUIDS
        }
    ]
}

function buildTrueAppearanceRequiredPath()
{
    return [
        {
            stage: 1,
            choose: DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid
        },
        {
            stage: 2,
            choose: DEFAULT_STAGE3_PREREQUISITE_STAGE2_CHOICES
        },
        {
            stage: 3,
            choose: DEFAULT_TRUE_APPEARANCE_STAGE3_CHOICE_UUIDS
        }
    ]
}

export const vampireTestDef = {
    id: "vampire",
    name: "Vampire",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: [
        {
            name: loopVars =>
                `stage 1 grants vampire base items with ${loopVars.name}`,

            loop: () => stage1Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE1_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, THE_SANGUINE_CURSE_UUID))
                )

                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, FANGED_BITE_UUID))
                )
            },

            finalAssertions: async ({actor, assert, expect, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage1BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})

                const sanguineCurse = getItemBySourceUuid(
                    actor,
                    THE_SANGUINE_CURSE_UUID
                )
                expectUsesMaxMatchesVampireFeedWindow(
                    expect,
                    sanguineCurse?.system?.uses?.max
                )
            }
        },
        {
            name: loopVars => `stage 1 applies ${loopVars.name}`,

            loop: () => stage1Choices,

            steps: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.uuid,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    Boolean(getItemBySourceUuid(actor, loopVars.uuid))
                )

                await loopVars.finalAwait({actor, waiters})
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage1AppliedActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars =>
                `stage 2 grants vampire stage 2 items with ${loopVars.name}`,

            loop: () => stage2ChoicePairs,

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                        captureVampireStage2InitialState(actor, staticVars)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE2_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, GREATER_SANGUINE_CURSE_UUID)
                    )
                )

                for (const sourceUuid of loopVars.uuids) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, sourceUuid))
                    )
                }
            },

            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto =
                          buildVampireStage2BaseActorValidationDTO(actor, loopVars)

                validate(actorDto, {assert})
            }
        },
        {
            name: loopVars => `stage 2 applies ${loopVars.name}`,

            loop: () => stage2ChoicePairs,

            steps: [
                {
                    stage: 1,
                    choose: () => DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.uuid,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 1,
                            sourceName:
                            DEFAULT_STAGE2_PREREQUISITE_STAGE1_CHOICE.name
                        })
                        captureVampireStage2InitialState(actor, staticVars)
                    }
                },
                {
                    stage: 2,
                    choose: loopVars => loopVars.uuids,
                    await: async ({runtime, actor, waiters, loopVars}) =>
                    {
                        await waitForAppliedStageWithoutAbilityScoreDialog({
                            runtime,
                            actor,
                            waiters,
                            stage: 2,
                            sourceName: loopVars.name
                        })
                    }
                }
            ],

            finalAwait: async ({actor, waiters, loopVars, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")
                        ?.maximumDaysPerFeed === STAGE2_MAXIMUM_DAYS_PER_FEED
                )

                await waiters.waitForCondition(() =>
                    Boolean(
                        getItemBySourceUuid(actor, GREATER_SANGUINE_CURSE_UUID)
                    )
                )

                for (const choice of loopVars.choices) {
                    await waiters.waitForCondition(() =>
                        Boolean(getItemBySourceUuid(actor, choice.uuid))
                    )
                    await choice.finalAwait({actor, waiters, staticVars})
                }
            },

            finalAssertions: async ({actor, assert, loopVars, staticVars}) =>
            {
                const actorDto = buildVampireStage2AppliedActorValidationDTO(
                    actor,
                    loopVars,
                    staticVars
                )

                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: [
        {
            name: loopVars => loopVars.name,

            loop: () => fangedBiteBehaviorCases,

            setup: async ({loopVars}) =>
            {
                configureFixedVampireAbilityScoreAdvancement(
                    loopVars.stage1ChoiceName
                )
            },

            requiredPath: [
                {
                    stage: 1,
                    choose: loopVars => loopVars.stage1ChoiceUuid
                }
            ],

            steps: [
                async ({actor, waiters, staticVars, loopVars}) =>
                {
                    const fangedBite = getItemBySourceUuid(
                        actor,
                        FANGED_BITE_UUID
                    )

                    if (!fangedBite) {
                        throw new Error("Fanged Bite item not present on actor")
                    }

                    const midiAttackActivity = getMainFangedBiteActivity(
                        fangedBite
                    )

                    if (!midiAttackActivity) {
                        throw new Error(
                            "Fanged Bite Midi Attack activity not present on actor"
                        )
                    }

                    const damageRollFormula = "1d6 + 1"

                    staticVars.fangedBite = fangedBite
                    staticVars.midiAttackActivity = midiAttackActivity
                    staticVars.damageRolls = [
                        {
                            formula: damageRollFormula,
                            _formula: damageRollFormula,
                            parts: [damageRollFormula],
                            options: {
                                types: ["piercing"]
                            }
                        }
                    ]

                    Hooks.call("dnd5e.preRollAttack", {
                        subject: {
                            actor,
                            item: fangedBite,
                            activity: midiAttackActivity
                        },
                        advantage: loopVars.attackHasAdvantage,
                        disadvantage: false
                    })

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()

                    Hooks.call("dnd5e.preRollDamageV2", {
                        workflow: {
                            actor,
                            item: fangedBite,
                            activity: midiAttackActivity,
                            advantage:
                                loopVars.damageWorkflowAdvantage ??
                                loopVars.attackHasAdvantage
                        },
                        rolls: staticVars.damageRolls
                    }, {}, {})

                    if (
                        loopVars.attackHasAdvantage ||
                        loopVars.damageWorkflowAdvantage
                    )
                    {
                        await waiters.waitForNextFrame()
                    }

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({actor, assert, staticVars, loopVars}) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    FANGED_BITE_UUID,
                    loopVars.stage1ChoiceUuid
                ])

                addFangedBiteValidation(actorDto)
                validate(actorDto, {assert})

                const contextDto = new ContextValidationDTO({
                    advantage:
                        loopVars.damageWorkflowAdvantage ??
                        loopVars.attackHasAdvantage,
                    rolls: staticVars.damageRolls.map(roll => ({
                        formula: roll.formula,
                        _formula: roll._formula,
                        part: roll.parts?.[0]
                    }))
                })

                contextDto.advantage =
                    loopVars.damageWorkflowAdvantage ??
                    loopVars.attackHasAdvantage
                contextDto.rolls = {
                    values: [
                        {
                            formula: loopVars.expectedFormula,
                            _formula: loopVars.expectedFormula,
                            part: loopVars.expectedFormula
                        }
                    ],
                    mode: "equal"
                }

                validate(contextDto, {assert})
            }
        },
        {
            name:
                "Sangromancy Specialist grants Enhance Cantrip Damage and renders a vampire midi chat card",

            setup: async ({actor, helpers, staticVars}) =>
            {
                staticVars.classItems = {
                    Wizard: await createCharacterClassWithHitDice({
                        actor,
                        helpers,
                        className: "Wizard",
                        levels: 4,
                        hitDiceValue: 2
                    })
                }
            },

            requiredPath: buildSangromancySpecialistRequiredPath(),

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    await prepareSangromancySpecialistChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        loopVars: {
                            charges: 2
                        }
                    })
                }
            ],

            await: async ({staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard({
                    preferLive: false
                })
                await staticVars.chatCardHelper.waitForButton(
                    {
                        text: "Roll 1 Die"
                    },
                    {
                        preferLive: false
                    }
                )
                await staticVars.chatCardHelper.waitForButton(
                    {
                        text: "Roll 2 Dice"
                    },
                    {
                        preferLive: false
                    }
                )
            },

            assertions: async ({actor, expect, assert, staticVars}) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    SANGROMANCY_SPECIALIST_UUID
                ], STAGE3_MAXIMUM_DAYS_PER_FEED)
                addSangromancySpecialistValidation(actorDto)
                validate(actorDto, {assert})

                const activity = getSangromancySpecialistActivity(
                    staticVars.sangromancySpecialist
                )

                expect(activity).to.exist
                expect(activity?.name).to.equal(
                    SANGROMANCY_SPECIALIST_ACTIVITY_NAME
                )
                expect(staticVars.message?.flags?.transformations?.vampireActivity)
                .to.equal("sangromancyEnhanceCantripDamage")
                expect(staticVars.message?.flags?.transformations?.state)
                .to.equal("initial")
                expect(
                    staticVars.message?.flags?.transformations?.maxDice
                ).to.equal(2)

                const card = staticVars.chatCardHelper.getCardElement({
                    require: true
                })
                expect(card.dataset.vampireActivity)
                .to.equal("sangromancyEnhanceCantripDamage")
                expect(String(staticVars.message?.content ?? ""))
                .to.contain('data-transformations-card="true"')
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 1 Die"
                    })
                ).to.equal(true)
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 2 Dice"
                    })
                ).to.equal(true)
                expect(
                    staticVars.chatCardHelper.hasButton({
                        text: "Roll 3 Dice"
                    })
                ).to.equal(false)
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => sangromancyResourceBehaviorCases,

            setup: async ({actor, helpers, loopVars, staticVars}) =>
            {
                staticVars.classItems = {}

                for (const classDefinition of loopVars.classDefinitions) {
                    staticVars.classItems[classDefinition.className] =
                        await createCharacterClassWithHitDice({
                            actor,
                            helpers,
                            className: classDefinition.className,
                            levels: classDefinition.levels,
                            hitDiceValue: classDefinition.hitDiceValue,
                            hitDiceMax: classDefinition.hitDiceMax ?? null
                        })
                }
            },

            requiredPath: buildSangromancySpecialistRequiredPath(),

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    await prepareSangromancySpecialistChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        loopVars
                    })
                }
            ],

            await: async ({staticVars, loopVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard({
                    preferLive: false
                })

                for (const buttonText of loopVars.expectedPresentButtons) {
                    await staticVars.chatCardHelper.waitForButton(
                        {
                            text: buttonText
                        },
                        {
                            preferLive: false
                        }
                    )
                }
            },

            assertions: async ({
                actor,
                runtime,
                expect,
                assert,
                helpers,
                waiters,
                loopVars,
                staticVars
            }) =>
            {
                const actorDto = createVampireActorValidationDTO(actor, [
                    SANGROMANCY_SPECIALIST_UUID
                ], STAGE3_MAXIMUM_DAYS_PER_FEED)
                addSangromancySpecialistValidation(actorDto)
                validate(actorDto, {assert})

                for (const buttonText of loopVars.expectedPresentButtons) {
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: buttonText
                        }),
                        `Expected button "${buttonText}" on Sangromancy Specialist card`
                    ).to.equal(true)
                }

                for (const buttonText of loopVars.expectedAbsentButtons) {
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: buttonText
                        }),
                        `Did not expect button "${buttonText}" on Sangromancy Specialist card`
                    ).to.equal(false)
                }

                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    rollHelper.queueRoll({
                        formula: loopVars.expectedFormula,
                        total: 7
                    })

                    await clickSangromancySpecialistCardButton({
                        actor,
                        runtime,
                        message: staticVars.message,
                        waiters,
                        text: loopVars.rollButtonText
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === loopVars.expectedFormula
                        )
                    )

                    await waiters.waitForCondition(() =>
                        staticVars.chatCardHelper.getMessage()
                            ?.flags?.transformations?.state === "rolled"
                    )

                    const presentedRolls =
                              await staticVars.chatCardHelper.waitForPresentedRolls({
                                  count: 1,
                                  preferLive: false
                              })

                    const currentSangromancySpecialist =
                              actor.items.get(staticVars.sangromancySpecialist.id) ??
                              getItemBySourceUuid(actor, SANGROMANCY_SPECIALIST_UUID)

                    expect(
                        currentSangromancySpecialist?.system?.uses?.spent
                    ).to.equal(loopVars.expectedUsesSpent)
                    expect(
                        staticVars.chatCardHelper.hasButton({
                            text: loopVars.rollButtonText
                        })
                    ).to.equal(false)

                    for (const classState of loopVars.expectedClassStates) {
                        await waiters.waitForCondition(() =>
                            Number(
                                staticVars.classItems[classState.className]
                                    ?.system?.hd?.value ?? 0
                            ) === classState.remainingHitDice
                        )

                        expect(
                            Number(
                                staticVars.classItems[classState.className]
                                    ?.system?.hd?.value ?? 0
                            )
                        ).to.equal(classState.remainingHitDice)
                    }

                    const contextDto = new ContextValidationDTO({
                        advantage: false,
                        rolls: presentedRolls.map(roll => ({
                            formula: roll.formula
                        }))
                    })
                    contextDto.advantage = false
                    contextDto.rolls = {
                        values: [
                            {
                                formula: loopVars.expectedFormula
                            }
                        ],
                        mode: "equal"
                    }

                    validate(contextDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },
        {
            name:
                "True Appearance revealTrueAppearance removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.revealTrueAppearance(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance revealTrueAppearance does nothing when the hiding effect is missing",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor}) =>
                {
                    await Vampire.revealTrueAppearance(resolveCurrentActor(actor))
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance Midi Save applies stage 3 DC on preUseActivity",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceItem) {
                        throw new Error(
                            "True Appearance save item not present on actor"
                        )
                    }

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.usageConfig = {}
                    staticVars.dialogConfig = {
                        dc: {
                            value: 0
                        }
                    }
                    staticVars.messageConfig = {}

                    Hooks.call(
                        "dnd5e.preUseActivity",
                        staticVars.trueAppearanceActivity,
                        staticVars.usageConfig,
                        staticVars.dialogConfig,
                        staticVars.messageConfig
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.formula
                ).to.equal("16")
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.value
                ).to.equal(16)
                expect(
                    staticVars.trueAppearanceActivity?.system?.save?.dc?.formula
                ).to.equal("16")
                expect(staticVars.dialogConfig?.dc?.value).to.equal(16)
                expect(staticVars.messageConfig?.dc?.value).to.equal(16)
            }
        },
        {
            name:
                "True Appearance Midi Save applies stage 4 DC on preActivityUse",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    await currentActor.setFlag("transformations", "stage", 4)
                    await waiters.waitForCondition(() =>
                        resolveCurrentActor(actor).getFlag(
                            "transformations",
                            "stage"
                        ) === 4
                    )

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.dialogConfig = {}
                    staticVars.messageConfig = {}

                    Hooks.call(
                        "dnd5e.preActivityUse",
                        staticVars.trueAppearanceActivity,
                        {},
                        staticVars.dialogConfig,
                        staticVars.messageConfig
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.formula
                ).to.equal("20")
                expect(
                    staticVars.trueAppearanceActivity?.save?.dc?.value
                ).to.equal(20)
                expect(
                    staticVars.trueAppearanceActivity?.system?.save?.dc?.formula
                ).to.equal("20")
                expect(staticVars.messageConfig?.dc?.value).to.equal(20)
            }
        },
        {
            name:
                "True Appearance DC override does not apply to the wrong activity",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const currentActor = resolveCurrentActor(actor)

                    staticVars.activity = {
                        name: "Not Midi Save",
                        actor: currentActor,
                        item: getTrueAppearanceItem(currentActor),
                        save: {
                            dc: {
                                calculation: "",
                                formula: "",
                                value: 0
                            }
                        },
                        system: {
                            save: {
                                dc: {
                                    calculation: "",
                                    formula: "",
                                    value: 0
                                }
                            }
                        }
                    }

                    Hooks.call(
                        "dnd5e.preUseActivity",
                        staticVars.activity,
                        {},
                        {},
                        {}
                    )

                    await waiters.waitForNextFrame()
                    await waiters.waitForNextFrame()
                }
            ],

            assertions: async ({expect, staticVars}) =>
            {
                expect(staticVars.activity?.save?.dc?.formula).to.equal("")
                expect(staticVars.activity?.save?.dc?.value).to.equal(0)
            }
        },
        {
            name: loopVars => loopVars.name,

            loop: () => trueAppearanceAutoTriggerCases,

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    staticVars.trueAppearanceItem =
                        getTrueAppearanceItem(currentActor)
                    staticVars.trueAppearanceActivity =
                        getTrueAppearanceSaveActivity(
                            staticVars.trueAppearanceItem
                        )

                    if (!staticVars.trueAppearanceActivity) {
                        throw new Error(
                            "True Appearance Midi Save activity not present on actor"
                        )
                    }

                    staticVars.trueAppearanceUseCount = 0

                    Object.defineProperty(
                        staticVars.trueAppearanceActivity,
                        "use",
                        {
                            configurable: true,
                            writable: true,
                            value: async function use()
                            {
                                staticVars.trueAppearanceUseCount += 1
                                return true
                            }
                        }
                    )
                },
                async ({actor, runtime, loopVars}) =>
                {
                    await runtime.services.triggerRuntime.run(
                        loopVars.trigger,
                        resolveCurrentActor(actor)
                    )
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                    staticVars.trueAppearanceUseCount === 1
                )
            },

            assertions: async ({actor, assert, expect, staticVars}) =>
            {
                expect(staticVars.trueAppearanceUseCount).to.equal(1)
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance failed Midi Save removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await runtime.services.triggerRuntime.run("savingThrow", currentActor, {
                        saves: {
                            current: {
                                ability: "con",
                                naturalRoll: 5,
                                total: 10,
                                success: false,
                                item: {
                                    sourceUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID
                                }
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance successful Midi Save keeps Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await runtime.services.triggerRuntime.run("savingThrow", currentActor, {
                        saves: {
                            current: {
                                ability: "con",
                                naturalRoll: 17,
                                total: 17,
                                success: true,
                                item: {
                                    sourceUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID
                                }
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: true
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance sunlight Radiant damage reveals the actor",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await currentActor.setFlag("transformations", "damageTypePerMidiId", {
                        "sunlight-source": "radiant"
                    })

                    await Vampire.onPreCalculateDamage({
                        actor: currentActor,
                        target: currentActor,
                        damage: 7,
                        details: {
                            midi: {
                                sourceActorUuid: "sunlight-source"
                            },
                            item: {
                                name: "Sunlight"
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance ignores non-sunlight Radiant damage",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await currentActor.setFlag("transformations", "damageTypePerMidiId", {
                        "moonbeam-source": "radiant"
                    })

                    await Vampire.onPreCalculateDamage({
                        actor: currentActor,
                        target: currentActor,
                        damage: 7,
                        details: {
                            midi: {
                                sourceActorUuid: "moonbeam-source"
                            },
                            item: {
                                name: "Moonbeam"
                            }
                        }
                    })
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: true
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: true
                })
            }
        },
        {
            name:
                "True Appearance feeding frenzy reveal removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.handleFeedingFrenzyReveal(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance hallowed ground reveal removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })

                    await Vampire.handleHallowedGroundReveal(currentActor)
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        },
        {
            name:
                "True Appearance manual reveal activity removes Hiding True Appearance",

            requiredPath: buildTrueAppearanceRequiredPath(),

            steps: [
                async ({actor, runtime, waiters}) =>
                {
                    const currentActor =
                              await ensureHidingTrueAppearanceEffect({
                                  actor,
                                  runtime,
                                  waiters
                              })
                    const item = getTrueAppearanceItem(currentActor)

                    await Vampire.onActivityUse(
                        {
                            name: "Reveal Yourself",
                            parent: {
                                parent: item
                            }
                        },
                        {
                            workflow: {
                                actor: currentActor,
                                item
                            }
                        },
                        null
                    )
                }
            ],

            await: async ({actor, runtime, waiters}) =>
            {
                await waitForHidingTrueAppearanceState({
                    actor,
                    runtime,
                    waiters,
                    present: false
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assertHidingTrueAppearanceState({
                    actor,
                    assert,
                    present: false
                })
            }
        }
    ]
}
