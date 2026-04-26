import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { waitForRollConfigurationDialogAndClickButton, waitForRollConfigurationDialogAndClose } from "../../../helpers/rollConfigurationDialog.js"
import { SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY, SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME, SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY } from "../../../../domain/transformation/subclasses/shadowsteelGhoul/triggers/shadowsteelGhoulTriggerCommon.js"

const DEBILITATING_MAGIC_NAME = "Debilitating Magic"
const DEBILITATING_MAGIC_UUID = "Compendium.transformations.gh-transformations.Item.jAHcNJNgWzYnzltV"
const DEBILITATING_MAGIC_CHOICE_UUIDS = Object.freeze([
    "Compendium.transformations.gh-transformations.Item.isnJl7FKtG06YPAu",
    "Compendium.transformations.gh-transformations.Item.uz5tgoO2cJUssjij",
    "Compendium.transformations.gh-transformations.Item.KjT5KJkSNDcrmQqr",
    "Compendium.transformations.gh-transformations.Item.6W4JqizsNFN16T5X",
    "Compendium.transformations.gh-transformations.Item.jiWt9gfGaLUfY0Fd",
    "Compendium.transformations.gh-transformations.Item.bwyV8maZr7H0NHNi"
])
const DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID = DEBILITATING_MAGIC_CHOICE_UUIDS[0]

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
const SHADOWSTEEL_ARCANE_VESSEL_UUID = "Compendium.transformations.gh-transformations.Item.fBNYwBpU5KAHwt2q"
const SHADOWSTEEL_FURY_UUID = "Compendium.transformations.gh-transformations.Item.ZQsAVpvhSsifyrTQ"
const SHADOWSTEEL_WEAPON_HEAL_ACTIVITY_NAME = "Shadowsteel Weapon Heal on Kill"
const SHADOWSTEEL_WEAPON_IMBUE_ACTIVITY_NAME = "Imbue with Shadowsteel fragment"
const SHADOWSTEEL_WEAPON_EFFECT_NAME = "Shadowsteel Weapon"
const FRIENDLESS_EFFECT_NAME = "Friendless"
const MAGIC_RESISTANCE_EFFECT_NAME = "Magic Resistance"
const SHADOWSTEEL_ABSORPTION_EFFECT_NAME = "Shadowsteel Absorption"
const SHADOWSTEEL_EXPLOSION_ITEM_NAME = "Shadowsteel Explosion"
const SHADOWSTEEL_EXPLOSION_STUNNED_EFFECT_NAME =
          "Shadowsteel Explosion: Stunned"
const SHADOWSTEEL_ARCANE_VESSEL_ITEM_NAME = "Shadowsteel Arcane Vessel"
const SHADOWSTEEL_FURY_ITEM_NAME = "Shadowsteel Fury"
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

function resolveItemActivities(item)
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

    if (typeof activities === "object") {
        return Object.values(activities).filter(activity =>
            activity &&
            typeof activity === "object"
        )
    }

    return []
}

function resolveItemActivityByName(item, activityName)
{
    return resolveItemActivities(item).find(activity =>
        activity?.name === activityName
    ) ?? null
}

function getTransformationOnceFlags(actor)
{
    const currentActor = game?.actors?.get?.(actor?.id) ?? actor

    return currentActor?.getFlag("transformations", "once") ?? {}
}

function getTransformationOnceFlag(actor, key)
{
    return getTransformationOnceFlags(actor)?.[key] ?? null
}

async function waitForTriggerStability({
    actor,
    runtime,
    waiters
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
}

async function waitForShadowsteelMidiSaveCallCount({
    waiters,
    staticVars,
    expectedCount
})
{
    await waiters.waitForCondition(() =>
        Number(staticVars.shadowsteelMidiSaveCallCount ?? 0) === expectedCount
    )
}

async function runShadowsteelTrigger({
    actor,
    runtime,
    waiters,
    trigger
})
{
    await runtime.services.triggerRuntime.run(trigger, actor)
    await waitForTriggerStability({
        actor,
        runtime,
        waiters
    })
}

async function triggerShadowsteelMidiSave({
    actor,
    runtime,
    waiters,
    staticVars,
    trigger,
    sourceName = "Shadowsteel Explosion"
})
{
    const pendingTrigger = runtime.services.triggerRuntime.run(trigger, actor)
    const expectedOnceKey =
              trigger === "bloodied"
                  ? SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY
                  : trigger === "zeroHp"
                      ? SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY
                      : null

    await waitForRollConfigurationDialogAndClickButton("normal", {
        title: "Damage Roll",
        subtitle: sourceName
    })

    await pendingTrigger
    await waitForTriggerStability({
        actor,
        runtime,
        waiters
    })

    if (expectedOnceKey) {
        await waiters.waitForCondition(() =>
            getTransformationOnceFlag(actor, expectedOnceKey) != null, {
            errorMessage:
                `${sourceName} did not set ${expectedOnceKey} after the ${trigger} trigger`
        })
    }

    try {
        await waitForRollConfigurationDialogAndClose({
            title: "Damage Roll",
            subtitle: sourceName,
            timeout: 100
        })
    } catch (_err) {
    }

    staticVars.shadowsteelMidiSaveCallCount =
        Number(staticVars.shadowsteelMidiSaveCallCount ?? 0) + 1
    staticVars.shadowsteelMidiSaveCalls = [
        ...(staticVars.shadowsteelMidiSaveCalls ?? []),
        {
            type: `trigger.${trigger}`,
            sourceName
        }
    ]
}

async function completeShortRest({
    actor,
    waiters
})
{
    Hooks.call("dnd5e.restCompleted", actor, {
        shortRest: true
    })

    await waiters.waitForCondition(() =>
        getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY) == null &&
        getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY) == null
    )
}

async function addShadowsteelGhoulTriggerItem({
    actor,
    helpers,
    staticVars,
    withActivity = true
})
{
    const sourceItem = await fromUuid(SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID)

    if (!sourceItem) {
        throw new Error("Shadowsteel Ghoul trigger item source could not be resolved")
    }

    const actorItemSource = withActivity
        ? sourceItem
        : {
            ...sourceItem.toObject(),
            uuid: sourceItem.uuid,
            system: {
                ...sourceItem.toObject().system,
                activities: {}
            }
        }

    const actorItem = await helpers.createActorItemAndWait(
        actor,
        actorItemSource
    )

    staticVars.shadowsteelGhoulTriggerItem = actorItem
    staticVars.shadowsteelMidiSaveCallCount = 0
    staticVars.shadowsteelMidiSaveCalls = []

    if (!withActivity) {
        return actorItem
    }

    const activity = resolveItemActivityByName(
        actorItem,
        SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME
    )

    if (!activity) {
        throw new Error("Shadowsteel Ghoul trigger item is missing Midi Save")
    }

    const originalUse =
              typeof activity.use === "function"
                  ? activity.use.bind(activity)
                  : null

    Object.defineProperty(activity, "use", {
        configurable: true,
        writable: true,
        value: async (...args) =>
        {
            return originalUse
                ? originalUse(...args)
                : true
        }
    })

    return actorItem
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

function buildDefaultStage4Steps()
{
    return [
        ...buildDefaultStage3Steps(),
        {
            stage: 4,
            await: async ({runtime, actor, waiters}) =>
            {
                await waitForStageCompletion({
                    runtime,
                    actor,
                    waiters,
                    stage: 4
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

function addShadowsteelExplosionAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID]
        item.itemName = SHADOWSTEEL_EXPLOSION_ITEM_NAME
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "shadowsteelGhoul"
        item.numberOfActivities = 1
        item.numberOfEffects = 1
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.saveAbility = ["con"]
            activity.saveDc = 20
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "4d10"
                damagePart.scalingNumber = 1
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["force"]
            })
        })
        item.addEffect(effect =>
        {
            effect.name = SHADOWSTEEL_EXPLOSION_STUNNED_EFFECT_NAME
            effect.type = "base"
            effect.statuses = ["stunned"]
        })
    })
}

function addShadowsteelArcaneVesselAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SHADOWSTEEL_ARCANE_VESSEL_UUID]
        item.itemName = SHADOWSTEEL_ARCANE_VESSEL_ITEM_NAME
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "shadowsteelGhoul"
        item.numberOfActivities = 0
        item.numberOfEffects = 0
    })
}

function addShadowsteelFuryAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SHADOWSTEEL_FURY_UUID]
        item.itemName = SHADOWSTEEL_FURY_ITEM_NAME
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "shadowsteelGhoul"
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.saveAbility = ["con"]
        })
    })
}

function getActorItemBySourceUuid(actor, sourceUuid)
{
    return actor.items.find(item =>
        item?.flags?.transformations?.sourceUuid === sourceUuid
    ) ?? null
}

function assertShadowsteelExplosionStructure(actor, assert)
{
    const item = getActorItemBySourceUuid(actor, SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID)
    const activity =
              resolveItemActivityByName(
                  item,
                  SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME
              ) ??
              resolveItemActivities(item)[0] ??
              null

    assert.isOk(item, "Shadowsteel Explosion item should be present")
    assert.strictEqual(item.system?.identifier, "shadowsteel-explosion")
    assert.isOk(activity, "Shadowsteel Explosion should expose Midi Save")
    assert.strictEqual(activity.save?.dc?.formula, "20")
    assert.strictEqual(String(activity.target?.template?.size ?? 0), "60")
    assert.strictEqual(activity.target?.affects?.type, "any")
    assert.strictEqual(activity.target?.template?.type, "radius")
    assert.strictEqual(activity.damage?.onSave, "half")
}

function assertShadowsteelArcaneVesselStructure(actor, assert)
{
    const item = getActorItemBySourceUuid(actor, SHADOWSTEEL_ARCANE_VESSEL_UUID)

    assert.isOk(item, "Shadowsteel Arcane Vessel item should be present")
    assert.strictEqual(item.system?.identifier, "shadowsteel-arcane-vessel")
    assert.strictEqual(item.system?.uses?.recovery?.[0]?.period, "lr")
    assert.strictEqual(item.system?.uses?.recovery?.[0]?.type, "recoverAll")
}

function assertShadowsteelFuryStructure(actor, assert)
{
    const item = getActorItemBySourceUuid(actor, SHADOWSTEEL_FURY_UUID)
    const activity = resolveItemActivities(item)[0] ?? null

    assert.isOk(item, "Shadowsteel Fury item should be present")
    assert.strictEqual(item.system?.identifier, "shadowsteel-fury")
    assert.isOk(activity, "Shadowsteel Fury should expose a save activity")
    assert.strictEqual(
        activity.save?.dc?.formula,
        "8 + @mod + @flags.transformations.stage"
    )
    assert.strictEqual(activity.target?.affects?.type, "creature")
    assert.strictEqual(activity.target?.prompt, true)
}

const shadowsteelGhoulTriggerBehaviorTests = [
    {
        name: "Shadowsteel trigger item uses Midi Save when actor becomes bloodied",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars
            })
        },
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "bloodied"
                })
            }
        ],
        await: async ({waiters, staticVars}) =>
        {
            await waitForShadowsteelMidiSaveCallCount({
                waiters,
                staticVars,
                expectedCount: 1
            })
        },
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(staticVars.shadowsteelMidiSaveCallCount, 1)
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
            assert.isNotOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel bloodied trigger does nothing when actor does not have the trigger item",
        steps: [
            async ({actor, runtime, waiters}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "bloodied"
                })
            }
        ],
        await: async ({actor, runtime, waiters}) =>
        {
            await waitForTriggerStability({
                actor,
                runtime,
                waiters
            })
        },
        assertions: async ({actor, assert}) =>
        {
            assert.isNotOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel bloodied trigger fires only once per short rest and resets after resting",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars
            })
        },
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "bloodied"
                })
                await waitForShadowsteelMidiSaveCallCount({
                    waiters,
                    staticVars,
                    expectedCount: 1
                })
            },
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "bloodied"
                })
            },
            async ({actor, waiters}) =>
            {
                await completeShortRest({
                    actor,
                    waiters
                })
            },
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "bloodied"
                })
            }
        ],
        await: async ({waiters, staticVars}) =>
        {
            await waitForShadowsteelMidiSaveCallCount({
                waiters,
                staticVars,
                expectedCount: 2
            })
        },
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(staticVars.shadowsteelMidiSaveCallCount, 2)
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel trigger item uses Midi Save when actor reaches 0 hp",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars
            })
        },
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "zeroHp"
                })
            }
        ],
        await: async ({waiters, staticVars}) =>
        {
            await waitForShadowsteelMidiSaveCallCount({
                waiters,
                staticVars,
                expectedCount: 1
            })
        },
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(staticVars.shadowsteelMidiSaveCallCount, 1)
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY)
            )
            assert.isNotOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel zeroHp trigger fires only once while actor remains at 0 hp",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars
            })
        },
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "zeroHp"
                })
                await waitForShadowsteelMidiSaveCallCount({
                    waiters,
                    staticVars,
                    expectedCount: 1
                })
            },
            async ({actor, runtime, waiters}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "zeroHp"
                })
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "zeroHp"
                })
            }
        ],
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(staticVars.shadowsteelMidiSaveCallCount, 1)
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel zeroHp trigger does nothing when actor does not have the trigger item",
        steps: [
            async ({actor, runtime, waiters}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "zeroHp"
                })
            }
        ],
        await: async ({actor, runtime, waiters}) =>
        {
            await waitForTriggerStability({
                actor,
                runtime,
                waiters
            })
        },
        assertions: async ({actor, assert}) =>
        {
            assert.isNotOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel bloodied and zeroHp triggers have independent once-per-rest limits",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars
            })
        },
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "bloodied"
                })
                await waitForShadowsteelMidiSaveCallCount({
                    waiters,
                    staticVars,
                    expectedCount: 1
                })
            },
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "zeroHp"
                })
                await waitForShadowsteelMidiSaveCallCount({
                    waiters,
                    staticVars,
                    expectedCount: 2
                })
            },
            async ({actor, runtime, waiters}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "bloodied"
                })
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "zeroHp"
                })
            },
            async ({actor, waiters}) =>
            {
                await completeShortRest({
                    actor,
                    waiters
                })
            },
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "bloodied"
                })
                await waitForShadowsteelMidiSaveCallCount({
                    waiters,
                    staticVars,
                    expectedCount: 3
                })
                await triggerShadowsteelMidiSave({
                    actor,
                    runtime,
                    waiters,
                    staticVars,
                    trigger: "zeroHp"
                })
            }
        ],
        await: async ({waiters, staticVars}) =>
        {
            await waitForShadowsteelMidiSaveCallCount({
                waiters,
                staticVars,
                expectedCount: 4
            })
        },
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(staticVars.shadowsteelMidiSaveCallCount, 4)
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
            assert.isOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY)
            )
        }
    },
    {
        name: "Shadowsteel trigger item handles a missing Midi Save activity gracefully",
        uuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
        setup: async ({actor, helpers, staticVars}) =>
        {
            await addShadowsteelGhoulTriggerItem({
                actor,
                helpers,
                staticVars,
                withActivity: false
            })
        },
        steps: [
            async ({actor, runtime, waiters}) =>
            {
                await runShadowsteelTrigger({
                    actor,
                    runtime,
                    waiters,
                    trigger: "bloodied"
                })
            }
        ],
        await: async ({actor, runtime, waiters}) =>
        {
            await waitForTriggerStability({
                actor,
                runtime,
                waiters
            })
        },
        assertions: async ({actor, assert, staticVars}) =>
        {
            assert.strictEqual(
                Number(staticVars.shadowsteelMidiSaveCallCount ?? 0),
                0
            )
            assert.isNotOk(
                getTransformationOnceFlag(actor, SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY)
            )
        }
    }
]

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
        },
        {
            name: "stage 4 with Shadowsteel Arcane Vessel and Shadowsteel Explosion",
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
                },
                {
                    stage: 4,
                    choose: SHADOWSTEEL_ARCANE_VESSEL_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waitForStageCompletion({
                            runtime,
                            actor,
                            waiters,
                            stage: 4
                        })
                    }
                }
            ],
            finalAwait: async args =>
                waitForStageStability({...args, stage: 4}),
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
                    CURSED_CLAW_UUID,
                    HEALING_RESISTANCE_UUID,
                    SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
                    SHADOWSTEEL_ARCANE_VESSEL_UUID
                ]
                actorDto.abilities[staticVars.curserAbilityKey].value =
                    staticVars.curserExpectedAbilityValue
                actorDto.abilities[staticVars.masterAbilityKey].value =
                    staticVars.masterExpectedAbilityValue
                addCursedClawFeatureAssertions(actorDto)
                addCursedClawAttackAssertions(actorDto)
                addHealingResistanceAssertions(actorDto)
                addShadowsteelExplosionAssertions(actorDto)
                addShadowsteelArcaneVesselAssertions(actorDto)

                validate(actorDto, {assert})
                assertShadowsteelExplosionStructure(actor, assert)
                assertShadowsteelArcaneVesselStructure(actor, assert)
            }
        },
        {
            name: "stage 4 with Shadowsteel Fury as the final available choice",
            setup: async () =>
            {
                await chooseDebilitatingMagic()
            },
            steps: buildDefaultStage4Steps(),
            finalAwait: async args =>
                waitForStageStability({...args, stage: 4}),
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    DEBILITATING_MAGIC_UUID,
                    DEFAULT_DEBILITATING_MAGIC_CHOICE_UUID,
                    SHADOWSTEEL_WEAPON_UUID,
                    MAGIC_RESISTANCE_UUID,
                    SHADOWSTEEL_ABSORPTION_UUID,
                    CURSED_CLAW_UUID,
                    HEALING_RESISTANCE_UUID,
                    SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
                    SHADOWSTEEL_FURY_UUID
                ]
                addCursedClawFeatureAssertions(actorDto)
                addCursedClawAttackAssertions(actorDto)
                addHealingResistanceAssertions(actorDto)
                addShadowsteelExplosionAssertions(actorDto)
                addShadowsteelFuryAssertions(actorDto)

                validate(actorDto, {assert})
                assertShadowsteelExplosionStructure(actor, assert)
                assertShadowsteelFuryStructure(actor, assert)
            }
        }
    ],
    itemBehaviorTests: shadowsteelGhoulTriggerBehaviorTests
}
