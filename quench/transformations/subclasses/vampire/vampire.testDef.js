import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"

const THE_SANGUINE_CURSE_UUID =
          "Compendium.transformations.gh-transformations.Item.Zd5sRelguKUDcoAP"
const FANGED_BITE_UUID =
          "Compendium.transformations.gh-transformations.Item.TreKDUe7BregxPRU"
const FZEG_CLAW_UUID =
          "Compendium.transformations.gh-transformations.Item.0ZgPuhqfVv3Nk0x4"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID = "ddjFKkSGslAQQjB4"
const MAXIMUM_DAYS_PER_FEED = 7
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
                effect.changes.changes = [
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
                effect.changes.changes = [
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

const placeholderChoices = Object.freeze([
    ...stage1Choices,
    {name: "Vampire Stage 2 Choice A", uuid: ""},
    {name: "Vampire Stage 2 Choice B", uuid: ""},
    {name: "Vampire Stage 3 Choice A", uuid: ""},
    {name: "Vampire Stage 3 Choice B", uuid: ""},
    {name: "Vampire Stage 4 Choice A", uuid: ""},
    {name: "Vampire Stage 4 Choice B", uuid: ""}
])

function getItemBySourceUuid(actor, sourceUuid)
{
    return actor.items.find(item =>
        item.flags?.transformations?.sourceUuid === sourceUuid
    )
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

function createVampireActorValidationDTO(actor, requiredSourceUuids = [])
{
    const actorDto = new ActorValidationDTO(actor)

    actorDto.hasItemWithSourceUuids = [...requiredSourceUuids]
    actorDto.flags.match.push({
        path: "transformations.vampire",
        expected: {
            maximumDaysPerFeed: MAXIMUM_DAYS_PER_FEED
        }
    })

    return actorDto
}

function expectUsesMaxMatchesVampireFeedWindow(expect, usesMax)
{
    expect(
        [
            "@flags.transformations.vampire.maximumDaysPerFeed",
            "7",
            7
        ].includes(usesMax),
        `Unexpected uses.max value: ${usesMax}`
    ).to.equal(true)
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

function buildVampireStage1BaseActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        THE_SANGUINE_CURSE_UUID,
        FANGED_BITE_UUID,
        loopVars.uuid
    ])

    addTheSanguineCurseValidation(actorDto)
    addFangedBiteValidation(actorDto)
    addStage1ChoiceItemValidation(actorDto, loopVars)

    return actorDto
}

function buildVampireStage1AppliedActorValidationDTO(actor, loopVars)
{
    const actorDto = createVampireActorValidationDTO(actor, [
        loopVars.uuid
    ])

    addStage1ChoiceItemValidation(actorDto, loopVars)
    loopVars.configureAppliedActorValidation(actorDto)

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
                        ?.maximumDaysPerFeed === MAXIMUM_DAYS_PER_FEED
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
        }
    ]
}
