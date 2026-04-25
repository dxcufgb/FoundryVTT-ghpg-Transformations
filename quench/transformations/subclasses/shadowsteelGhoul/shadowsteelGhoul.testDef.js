import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const DEBILITATING_MAGIC_NAME = "Debilitating Magic"
const DEBILITATING_MAGIC_UUID =
          "Compendium.transformations.gh-transformations.Item.jAHcNJNgWzYnzltV"
const DEBILITATING_MAGIC_CHOICE_UUIDS = Object.freeze([
    "Compendium.transformations.gh-transformations.Item.isnJl7FKtG06YPAu",
    "Compendium.transformations.gh-transformations.Item.uz5tgoO2cJUssjij",
    "Compendium.transformations.gh-transformations.Item.KjT5KJkSNDcrmQqr",
    "Compendium.transformations.gh-transformations.Item.6W4JqizsNFN16T5X",
    "Compendium.transformations.gh-transformations.Item.jiWt9gfGaLUfY0Fd",
    "Compendium.transformations.gh-transformations.Item.bwyV8maZr7H0NHNi"
])
const DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID =
          DEBILITATING_MAGIC_CHOICE_UUIDS[0]

const SHADOWSTEEL_CURSER_UUID = "Compendium.transformations.gh-transformations.Item.RshxXEgOJC48inhb"
const SHADOWSTEEL_ADEPT_UUID = "Compendium.transformations.gh-transformations.Item.GwljdRzCeN45tXwU"
const SHADOWSTEEL_WEAPON_UUID = "Compendium.transformations.gh-transformations.Item.Wzrt24WLkhcY77sr"
const FRIENDLESS_UUID = "Compendium.transformations.gh-transformations.Item.L0FKF6UOzmw52wGQ"
const MAGIC_RESISTANCE_UUID = "Compendium.transformations.gh-transformations.Item.Rk5NUrsyEyNZ31fq"
const SHADOWSTEEL_ABSORPTION_UUID = "Compendium.transformations.gh-transformations.Item.Gf5NFuIgltNZ1RFI"
const SHADOWSTEEL_CASTER_UUID = "Compendium.transformations.gh-transformations.Item.gvvygnTzC90tBIGL"
const SHADOWSTEEL_MASTER_UUID = "Compendium.transformations.gh-transformations.Item.4YcoPEDzRJx4ozHb"
const CURSED_CLAW_UUID = "Compendium.transformations.gh-transformations.Item.1ZK9Hn5Ap2ElY9zw"
const CURSED_CLAW_ATTACK_UUID = "Compendium.transformations.gh-transformations.Item.bTbxbNpRk21fnpwa"
const HEALING_RESISTANCE_UUID = "Compendium.transformations.gh-transformations.Item.HvC6Uee6gg6jpq3d"
const SHADOWSTEEL_WEAPON_HEAL_ACTIVITY_NAME = "Shadowsteel Weapon Heal on Kill"
const SHADOWSTEEL_WEAPON_IMBUE_ACTIVITY_NAME = "Imbue with Shadowsteel fragment"
const SHADOWSTEEL_WEAPON_EFFECT_NAME = "Shadowsteel Weapon"
const FRIENDLESS_EFFECT_NAME = "Friendless"
const MAGIC_RESISTANCE_EFFECT_NAME = "Magic Resistance"
const SHADOWSTEEL_ABSORPTION_EFFECT_NAME = "Shadowsteel Absorption"
const SHADOWSTEEL_CASTER_ACTIVITY_NAME = "Regain Spell Slot"
const SHADOWSTEEL_MASTER_ITEM_NAME = "Shadowsteel Master (Shadowsteel Ghoul)"
const SHADOWSTEEL_MASTER_HARMONY_ACTIVITY_NAME = "Necrotic Harmony"
const SHADOWSTEEL_MASTER_WEAPON_ACTIVITY_NAME = "Necrotic Weapon"
const CURSED_CLAW_ITEM_NAME = "Cursed Claw"
const HEALING_RESISTANCE_ITEM_NAME = "Healing Resistance"
const CURSED_CLAW_ATTACK_ITEM_NAME = "Claw"
const SHADOWSTEEL_CURSER_ALLOWED_ABILITY_KEYS = Object.freeze([
    "wis",
    "int",
    "cha"
])

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

function buildDebilitatingMagicLoopCases()
{
    return DEBILITATING_MAGIC_CHOICE_UUIDS.map(choiceUuid => ({
        debilitatingMagicChoiceUuid: choiceUuid
    }))
}

async function chooseDebilitatingMagic({
    choiceUuid = DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID
} = {})
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: DEBILITATING_MAGIC_NAME,
            choice: choiceUuid
        }
    ]
}

async function waitForStageStability({
    runtime,
    actor,
    waiters,
    stage
})
{
    await waitForStageCompletion({
        runtime,
        actor,
        waiters,
        stage
    })
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
}

async function waitForStageCompletion({
    runtime,
    actor,
    waiters,
    stage
})
{
    await waiters.waitForStageFinished(
        runtime,
        actor,
        waiters.waitForCondition,
        stage
    )
}

function resolveShadowsteelCurserAbilityKey(actor)
{
    return SHADOWSTEEL_CURSER_ALLOWED_ABILITY_KEYS.find(abilityKey =>
        Number(actor?.system?.abilities?.[abilityKey]?.value ?? 0) < 20
    ) ?? null
}

function resolveShadowsteelMasterAbilityKey(actor, {
    excludedAbilityKeys = []
} = {})
{
    return SHADOWSTEEL_CURSER_ALLOWED_ABILITY_KEYS.find(abilityKey =>
        !excludedAbilityKeys.includes(abilityKey) &&
        Number(actor?.system?.abilities?.[abilityKey]?.value ?? 0) < 20
    ) ?? resolveShadowsteelCurserAbilityKey(actor)
}

async function chooseAbilityScoreAdvancementIncrease({
    runtime,
    actor,
    waiters,
    abilityKey,
    expectedValue,
    stage,
    sourceName
})
{
    await waiters.waitForCondition(() =>
        getAbilityScoreAdvancementDialogElement() != null
    )

    const dialog = getAbilityScoreAdvancementDialogElement()
    if (!dialog) {
        throw new Error(`${sourceName} ability score dialog did not open`)
    }

    const increaseButton = dialog.querySelector(
        `[data-action='increase'][data-ability-key='${abilityKey}']`
    )

    if (!increaseButton) {
        throw new Error(
            `${sourceName} increase button not found for ${abilityKey}`
        )
    }

    if (increaseButton.disabled) {
        throw new Error(
            `${sourceName} increase button was disabled for ${abilityKey}`
        )
    }

    increaseButton.click()
    await waiters.waitForNextFrame()

    const selectedValue = dialog.querySelector(
        `[data-ability-row='${abilityKey}'] [data-selected-value]`
    )

    await waiters.waitForCondition(() =>
        selectedValue?.textContent?.trim() ===
        String(expectedValue)
    )

    const confirmButton = dialog.querySelector("[data-action='confirm']")
    if (!confirmButton) {
        throw new Error(`${sourceName} confirm button not found`)
    }

    confirmButton.click()
    await waiters.waitForNextFrame()

    await waiters.waitForCondition(() =>
        getAbilityScoreAdvancementDialogElement() == null
    )
    await waiters.waitForStageFinished(
        runtime,
        actor,
        waiters.waitForCondition,
        stage
    )
}

async function chooseShadowsteelCurserAbilityIncrease({
    runtime,
    actor,
    waiters,
    staticVars
})
{
    await chooseAbilityScoreAdvancementIncrease({
        runtime,
        actor,
        waiters,
        abilityKey: staticVars.curserAbilityKey,
        expectedValue: staticVars.curserExpectedAbilityValue,
        stage: 1,
        sourceName: "Shadowsteel Curser"
    })
}

async function chooseShadowsteelMasterAbilityIncrease({
    runtime,
    actor,
    waiters,
    staticVars
})
{
    await chooseAbilityScoreAdvancementIncrease({
        runtime,
        actor,
        waiters,
        abilityKey: staticVars.masterAbilityKey,
        expectedValue: staticVars.masterExpectedAbilityValue,
        stage: 2,
        sourceName: "Shadowsteel Master"
    })
}

function buildDefaultStage3Steps()
{
    return [
        {
            stage: 1,
            choose: SHADOWSTEEL_WEAPON_UUID,
            await: async ({runtime, actor, waiters}) =>
            {
                await waitForStageCompletion({
                    runtime,
                    actor,
                    waiters,
                    stage: 1
                })
            }
        },
        {
            stage: 2,
            choose: [
                MAGIC_RESISTANCE_UUID,
                SHADOWSTEEL_ABSORPTION_UUID
            ],
            await: async ({runtime, actor, waiters}) =>
            {
                await waitForStageCompletion({
                    runtime,
                    actor,
                    waiters,
                    stage: 2
                })
            }
        },
        {
            stage: 3,
            await: async ({runtime, actor, waiters}) =>
            {
                await waitForStageCompletion({
                    runtime,
                    actor,
                    waiters,
                    stage: 3
                })
            }
        }
    ]
}

function addCursedClawFeatureAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [CURSED_CLAW_UUID]
        item.itemName = CURSED_CLAW_ITEM_NAME
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "shadowsteelGhoul"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = CURSED_CLAW_ITEM_NAME
            effect.type = "base"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "macro.createItem",
                    mode: 0,
                    value: CURSED_CLAW_ATTACK_UUID,
                    priority: 20
                }
            ]
        })
    })
}

function addCursedClawAttackAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.itemName = CURSED_CLAW_ATTACK_ITEM_NAME
        item.type = "weapon"
        item.addDamagePart("base", damagePart =>
        {
            damagePart.roll = "2d6"
            damagePart.bonus = "@mod"
        })
    })
}

function addHealingResistanceAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [HEALING_RESISTANCE_UUID]
        item.itemName = HEALING_RESISTANCE_ITEM_NAME
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "shadowsteelGhoul"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = HEALING_RESISTANCE_ITEM_NAME
            effect.type = "base"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "system.traits.da.healing",
                    mode: 2,
                    value: "0.5",
                    priority: 20
                }
            ]
        })
    })
}

export const shadowsteelGhoulTestDef = {
    id: "shadowsteelGhoul",
    name: "Shadowsteel Ghoul",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) =>
                `stage 1 with Debilitating Magic choice ${loopVars.debilitatingMagicChoiceUuid}`,
            loop: () => buildDebilitatingMagicLoopCases(),
            setup: async ({loopVars}) =>
            {
                await chooseDebilitatingMagic({
                    choiceUuid: loopVars.debilitatingMagicChoiceUuid
                })
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
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
                waitForStageStability({...args, stage: 1}),
            finalAssertions: async ({actor, assert, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    loopVars.debilitatingMagicChoiceUuid,
                    SHADOWSTEEL_WEAPON_UUID
                ]

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Shadowsteel Curser",
            setup: async ({actor, staticVars}) =>
            {
                await chooseDebilitatingMagic()
                staticVars.curserAbilityKey =
                    resolveShadowsteelCurserAbilityKey(actor)

                if (!staticVars.curserAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Curser ability was available to increase"
                    )
                }

                staticVars.curserExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.curserAbilityKey]
                            ?.value ?? 0
                    ) + 1
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_CURSER_UUID,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelCurserAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 1}),
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_CURSER_UUID,
                    SHADOWSTEEL_ADEPT_UUID
                ]
                actorDto.abilities[staticVars.curserAbilityKey].value =
                    staticVars.curserExpectedAbilityValue
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_CURSER_UUID]
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 1 with Shadowsteel Weapon",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
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
                waitForStageStability({...args, stage: 1}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID
                ]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_WEAPON_UUID]
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 2
                    item.numberOfEffects = 1
                    item.addActivity(activity =>
                    {
                        activity.name = SHADOWSTEEL_WEAPON_HEAL_ACTIVITY_NAME
                        activity.activationType = "special"
                        activity.duration.units = "inst"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.target.prompt = true
                        activity.healing.roll = "1d8"
                        activity.healing.numberOfTypes = 1
                        activity.healing.types = ["temphp"]
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = SHADOWSTEEL_WEAPON_IMBUE_ACTIVITY_NAME
                        activity.activationType = "longRest"
                        activity.duration.units = "inst"
                        activity.range.units = "self"
                        activity.target.affects.count = "1"
                        activity.target.affects.type = "object"
                        activity.target.prompt = false
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = SHADOWSTEEL_WEAPON_EFFECT_NAME
                        effect.type = "enchantment"
                        effect.changes.count = 2
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Magic Resistance",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: [
                        MAGIC_RESISTANCE_UUID,
                        SHADOWSTEEL_ABSORPTION_UUID
                    ],
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 2}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID
                ]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [MAGIC_RESISTANCE_UUID]
                    item.itemName = "Magic Resistance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = MAGIC_RESISTANCE_EFFECT_NAME
                        effect.type = "base"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "flags.midi-qol.magicResistance.all",
                                value: "1",
                                mode: 0
                            }
                        ]
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 grants Friendless",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: [
                        MAGIC_RESISTANCE_UUID,
                        SHADOWSTEEL_ABSORPTION_UUID
                    ],
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 2}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID,
                    FRIENDLESS_UUID
                ]
                actorDto.abilities.cha.check.roll.mode = -1
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [FRIENDLESS_UUID]
                    item.itemName = "Friendless"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = FRIENDLESS_EFFECT_NAME
                        effect.type = "base"
                        effect.changes.count = 1
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Shadowsteel Absorption",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_WEAPON_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: [
                        MAGIC_RESISTANCE_UUID,
                        SHADOWSTEEL_ABSORPTION_UUID
                    ],
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 2}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID
                ]
                actorDto.stats.ac = 11
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_ABSORPTION_UUID]
                    item.itemName = "Shadowsteel Absorption"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = SHADOWSTEEL_ABSORPTION_EFFECT_NAME
                        effect.type = "base"
                        effect.changes.count = 1
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Shadowsteel Caster",
            setup: async ({actor, staticVars}) =>
            {
                await chooseDebilitatingMagic()
                staticVars.curserAbilityKey =
                    resolveShadowsteelCurserAbilityKey(actor)

                if (!staticVars.curserAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Curser ability was available to increase"
                    )
                }

                staticVars.curserExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.curserAbilityKey]
                            ?.value ?? 0
                    ) + 1
                staticVars.masterAbilityKey =
                    resolveShadowsteelMasterAbilityKey(actor, {
                        excludedAbilityKeys: [staticVars.curserAbilityKey]
                    })

                if (!staticVars.masterAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Master ability was available to increase"
                    )
                }

                staticVars.masterExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.masterAbilityKey]
                            ?.value ?? 0
                    ) + 1
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_CURSER_UUID,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelCurserAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                },
                {
                    stage: 2,
                    choose: [
                        SHADOWSTEEL_CASTER_UUID,
                        MAGIC_RESISTANCE_UUID
                    ],
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelMasterAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 2}),
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorSpellMod = actor.system.attributes.spell.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_CURSER_UUID,
                    SHADOWSTEEL_ADEPT_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_CASTER_UUID,
                    SHADOWSTEEL_MASTER_UUID
                ]
                actorDto.abilities[staticVars.curserAbilityKey].value =
                    staticVars.curserExpectedAbilityValue
                actorDto.abilities[staticVars.masterAbilityKey].value =
                    staticVars.masterExpectedAbilityValue
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_CASTER_UUID]
                    item.itemName = "Shadowsteel Caster"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.name = SHADOWSTEEL_CASTER_ACTIVITY_NAME
                        activity.activationType = "action"
                        activity.duration.units = "inst"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.target.prompt = true
                        activity.uses.max = actorSpellMod
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Shadowsteel Master",
            setup: async ({actor, staticVars}) =>
            {
                await chooseDebilitatingMagic()
                staticVars.curserAbilityKey =
                    resolveShadowsteelCurserAbilityKey(actor)

                if (!staticVars.curserAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Curser ability was available to increase"
                    )
                }

                staticVars.curserExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.curserAbilityKey]
                            ?.value ?? 0
                    ) + 1
                staticVars.masterAbilityKey =
                    resolveShadowsteelMasterAbilityKey(actor, {
                        excludedAbilityKeys: [staticVars.curserAbilityKey]
                    })

                if (!staticVars.masterAbilityKey) {
                    throw new Error(
                        "No valid Shadowsteel Master ability was available to increase"
                    )
                }

                staticVars.masterExpectedAbilityValue =
                    Number(
                        actor.system?.abilities?.[staticVars.masterAbilityKey]
                            ?.value ?? 0
                    ) + 1
            },
            steps: [
                {
                    stage: 1,
                    choose: SHADOWSTEEL_CURSER_UUID,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelCurserAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                },
                {
                    stage: 2,
                    choose: [
                        SHADOWSTEEL_CASTER_UUID,
                        MAGIC_RESISTANCE_UUID
                    ],
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await chooseShadowsteelMasterAbilityIncrease({
                            runtime,
                            actor,
                            waiters,
                            staticVars
                        })
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 2}),
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_CURSER_UUID,
                    SHADOWSTEEL_ADEPT_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_CASTER_UUID,
                    SHADOWSTEEL_MASTER_UUID
                ]
                actorDto.abilities[staticVars.curserAbilityKey].value =
                    staticVars.curserExpectedAbilityValue
                actorDto.abilities[staticVars.masterAbilityKey].value =
                    staticVars.masterExpectedAbilityValue
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [SHADOWSTEEL_MASTER_UUID]
                    item.itemName = SHADOWSTEEL_MASTER_ITEM_NAME
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "shadowsteelGhoul"
                    item.numberOfActivities = 2
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.name = SHADOWSTEEL_MASTER_HARMONY_ACTIVITY_NAME
                        activity.activationType = "special"
                        activity.duration.units = "inst"
                        activity.range.value = "5"
                        activity.range.units = "ft"
                        activity.target.prompt = true
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "1d4"
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["necrotic"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = SHADOWSTEEL_MASTER_WEAPON_ACTIVITY_NAME
                        activity.activationType = "special"
                        activity.duration.units = "inst"
                        activity.range.value = "5"
                        activity.range.units = "ft"
                        activity.target.affects.count = "1"
                        activity.target.affects.type = "creature"
                        activity.target.prompt = true
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "2d8"
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["necrotic"]
                        })
                    })
                })

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 3 with Cursed Claw",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: buildDefaultStage3Steps(),
            finalAwait: async args =>
                waitForStageStability({...args, stage: 3}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID,
                    FRIENDLESS_UUID,
                    CURSED_CLAW_UUID,
                    HEALING_RESISTANCE_UUID
                ]
                addCursedClawFeatureAssertions(actorDto)
                addCursedClawAttackAssertions(actorDto)

                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 3 with Healing Resistance",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: buildDefaultStage3Steps(),
            finalAwait: async args => waitForStageStability({...args, stage: 3}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID,
                    FRIENDLESS_UUID,
                    CURSED_CLAW_UUID,
                    HEALING_RESISTANCE_UUID
                ]
                addHealingResistanceAssertions(actorDto)

                validate(actorDto, {assert})
                assert.strictEqual(
                    Number(actor.system?.traits?.da?.healing),
                    0.5,
                    "Healing Resistance should halve healing received"
                )
            }
        }
    ]
}
