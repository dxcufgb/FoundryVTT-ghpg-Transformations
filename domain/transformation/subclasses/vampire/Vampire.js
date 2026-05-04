import { Transformation } from "../../Transformation.js"
import { SangromancySpecialistEnhanceCantripDamage } from "./activities/SangromancySpecialistEnhanceCantripDamage.js"
import { getTrueAppearanceSaveDcForStage, TRUE_APPEARANCE_EFFECT_NAME, TRUE_APPEARANCE_MANUAL_REVEAL_ACTIVITY_NAMES, TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES, TRUE_APPEARANCE_SAVE_ACTIVITY_NAME, TRUE_APPEARANCE_SAVE_ITEM_UUID } from "./triggers/trueAppearanceTriggerCommon.js"

const FANGED_BITE_UUID =
          "Compendium.transformations.gh-transformations.Item.TreKDUe7BregxPRU"
const FZEG_CLAW_UUID =
          "Compendium.transformations.gh-transformations.Item.0ZgPuhqfVv3Nk0x4"
const STRIGOI_BLOODLINE_UUID =
          "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7"
const SOMAN_BLOODLINE_UUID =
          "Compendium.transformations.gh-transformations.Item.JwXmICxuswhNaTxu"
const FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID =
          "Compendium.transformations.gh-transformations.Item.v002gdymkyOVGowv"
const FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID =
          "Compendium.transformations.gh-transformations.Item.jLyYcsZUVMYntiTI"
const SANGROMANCY_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"
const SANGROMANCY_HIT_DIE_FORMULA = "1d12"
const SANGROMANCY_HIT_DIE_FLAVOR = "Sangromancy Hit Die Maximum"
const SANGROMANCY_FLAG_SCOPE = "transformations"
const SANGROMANCY_FLAG_KEY = "vampire.sangromancyHitDieMax"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID = "ddjFKkSGslAQQjB4"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_NAME = "Midi Attack"
const FANGED_BITE_NECROTIC_SAVE_ACTIVITY_NAME = "Necrotic Save"
const FZEG_CLAW_MIDI_ATTACK_ACTIVITY_NAME = "Midi Attack"
const FANGED_BITE_STRIGOI_DAMAGE_FORMULA = "2d4"
const FANGED_BITE_BASE_DAMAGE_FORMULA = "1d6"
const FANGED_BITE_NECROTIC_SAVE_SOMAN_DAMAGE_FORMULA = "1d8"
const FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_FORMULA = "3d8"
const FZEG_CLAW_BASE_DAMAGE_FORMULA = "1d8"
const FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_FORMULA = "3d6"
const TRUE_APPEARANCE_SAVE_FLAG_KEY = "saveItemUuid"
const TRUE_APPEARANCE_MANUAL_REVEAL_ACTIVITY_NAMES_NORMALIZED =
          new Set(
              TRUE_APPEARANCE_MANUAL_REVEAL_ACTIVITY_NAMES.map(name =>
                  normalizeWhitespace(name).toLowerCase()
              )
          )
const TRUE_APPEARANCE_REVEAL_TRIGGER_CONFIG = Object.freeze({
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.BECOMING_BLOODIED]: {
        requiresSave: true
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.CONCENTRATING_ON_SPELL]: {
        requiresSave: true
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.UNCONSCIOUS]: {
        requiresSave: true
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.RADIANT_SUNLIGHT_DAMAGE]: {
        requiresSave: false
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.FEEDING_FRENZY]: {
        requiresSave: false
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.HALLOWED_GROUND]: {
        requiresSave: false
    },
    [TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.MANUAL_REVEAL]: {
        requiresSave: false
    }
})

const pendingStrigoiFangedBiteUpgrade = new Map()
const pendingSangromancyHitDieRolls = new Set()

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Vampire extends Transformation
{
    static type = "vampire"
    static displayName = "Vampire"
    static itemId = "vampire"
    static uuid = "Compendium.transformations.gh-transformations.Item.vdAGsEjCSqDRp32j"

    static async maybeRollSangromancyHitDie(actor, grantedItem)
    {
        if (!actor) {
            this.warn("Skipping Sangromancy roll: actor missing")
            return null
        }

        if (!grantedItem) {
            this.warn("Skipping Sangromancy roll: granted item missing")
            return null
        }

        if (!this.isSangromancyItem(grantedItem)) {
            return null
        }

        if (this.hasExistingSangromancyHitDieFlag(actor)) {
            return this.getSangromancyHitDieFlag(actor)
        }

        if (typeof actor?.setFlag !== "function") {
            this.warn("Skipping Sangromancy roll: actor.setFlag unavailable", {
                actorId: actor?.id ?? null
            })
            return null
        }

        const pendingKey = this.resolveSangromancyPendingKey(actor)
        if (pendingSangromancyHitDieRolls.has(pendingKey)) {
            return null
        }

        pendingSangromancyHitDieRolls.add(pendingKey)

        try {
            const roll = await this.rollSangromancyHitDie(actor)
            const total = roll?.total

            if (!this.isValidSangromancyHitDieTotal(total)) {
                this.warn("Skipping Sangromancy flag update: invalid roll total", {
                    total
                })
                return null
            }

            await actor.setFlag(
                SANGROMANCY_FLAG_SCOPE,
                SANGROMANCY_FLAG_KEY,
                total
            )

            return total
        } catch (error) {
            this.error("Failed Sangromancy hit die roll", error)
            return null
        } finally {
            pendingSangromancyHitDieRolls.delete(pendingKey)
        }
    }

    static async onPreRollSavingThrow(context, actor)
    {
        const item = context?.workflow?.item ?? null

        if (!this.isTrueAppearanceSaveItem(item)) {
            return
        }

        if (typeof actor?.setFlag !== "function") {
            return
        }

        await actor.setFlag(
            "transformations",
            TRUE_APPEARANCE_SAVE_FLAG_KEY,
            TRUE_APPEARANCE_SAVE_ITEM_UUID
        )
    }

    static async onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        this.configureTrueAppearanceSaveDc({
            activity,
            usageConfig,
            dialogConfig,
            messageConfig,
            actor
        })
    }

    static async onPreRollAttack({
        actor,
        item,
        rollConfig
    } = {})
    {
        const actorKey = this.resolveActorKey(actor)
        if (!actorKey) return

        if (!this.shouldUpgradeStrigoiFangedBiteDamage({
            actor,
            item,
            activity: this.resolveActivityFromAttackRollConfig(rollConfig),
            rollConfig
        }))
        {
            pendingStrigoiFangedBiteUpgrade.delete(actorKey)
            return
        }

        pendingStrigoiFangedBiteUpgrade.set(actorKey, {
            itemUuid: this.resolveSourceUuid(item),
            activityId: this.resolveActivityId(
                this.resolveActivityFromAttackRollConfig(rollConfig)
            )
        })
    }

    static async onPreRollDamage({
        actor,
        item,
        activity,
        rolls = [],
        workflow = null,
        config = null
    } = {})
    {
        const actorKey = this.resolveActorKey(actor)
        if (!actorKey) return

        if (this.isFangedBiteNecroticSaveDamageContext({
            item,
            activity,
            workflow,
            config
        }))
        {
            const damageFormula =
                      this.resolveFangedBiteNecroticSaveDamageFormula(actor)

            if (!damageFormula) {
                return
            }

            this.upgradeFangedBiteNecroticSaveDamageRolls(rolls, damageFormula)
            return
        }

        if (this.shouldUpgradeFzegClawMidiAttackDamage({
            actor,
            item,
            activity,
            workflow,
            config
        })) {
            this.upgradeFzegClawMidiAttackDamageRolls(rolls)
            return
        }

        if (!this.isFangedBiteMidiAttack({item, activity})) {
            return
        }

        const pendingUpgrade = pendingStrigoiFangedBiteUpgrade.get(actorKey)
        const shouldUpgradeFromDamageContext =
                  this.shouldUpgradeStrigoiFangedBiteDamageFromDamageContext({
                      actor,
                      item,
                      activity,
                      workflow,
                      config
                  })

        if (pendingUpgrade) {
            pendingStrigoiFangedBiteUpgrade.delete(actorKey)
        }

        if (
            !shouldUpgradeFromDamageContext &&
            !this.matchesPendingStrigoiFangedBiteUpgrade(
                pendingUpgrade,
                {item, activity}
            )
        )
        {
            return
        }

        this.upgradeFangedBiteDamageRolls(rolls)
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        itemRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    } = {})
    {
        if (!actor?.isOwner) return

        if (
            message?.flags?.transformations?.vampireActivity ===
            SangromancySpecialistEnhanceCantripDamage.id
        )
        {
            SangromancySpecialistEnhanceCantripDamage.bind({
                actor,
                message,
                html,
                actorRepository,
                itemRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        }
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector,
        itemRepository
    )
    {
        const actor =
                  usage?.workflow?.actor ??
                  this.resolveActorFromDocument(activity)

        if (this.isTrueAppearanceManualRevealActivity({activity, usage})) {
            await this.handleManualReveal(actor, {
                activity,
                usage,
                message
            })
        }

        if (
            !SangromancySpecialistEnhanceCantripDamage.matchesActivity({
                activity,
                usage
            })
        )
        {
            return
        }

        await SangromancySpecialistEnhanceCantripDamage.activityUse({
            actor,
            item:
                SangromancySpecialistEnhanceCantripDamage.resolveItem({
                    activity,
                    usage
                }),
            message,
            actorRepository,
            itemRepository,
            ChatMessagePartInjector
        })
    }

    static async onPreCalculateDamage({
        actor,
        target,
        damage,
        details
    } = {})
    {
        if (!this.isRadiantDamageFromSunlight({
            actor,
            target,
            damage,
            details
        }))
        {
            return
        }

        await this.handleTrueAppearanceRevealTrigger(
            actor,
            TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.RADIANT_SUNLIGHT_DAMAGE,
            {
                target,
                damage,
                details
            }
        )
    }

    static async revealTrueAppearance(actor, context = {})
    {
        if (!actor || !this.isVampireTransformationActor(actor)) {
            return false
        }

        return this.removeHidingTrueAppearance(actor, context)
    }

    static async handleTrueAppearanceRevealTrigger(
        actor,
        triggerType,
        context = {}
    )
    {
        if (!actor || !this.isVampireTransformationActor(actor)) {
            return false
        }

        if (!this.hasNamedEffect(actor, TRUE_APPEARANCE_EFFECT_NAME)) {
            return false
        }

        const triggerConfig =
                  TRUE_APPEARANCE_REVEAL_TRIGGER_CONFIG[triggerType] ?? null

        if (!triggerConfig) {
            return false
        }

        if (triggerConfig.requiresSave) {
            return this.callTrueAppearanceSave(actor, {
                triggerType,
                context
            })
        }

        return this.revealTrueAppearance(actor, {
            triggerType,
            ...context
        })
    }

    static async handleFeedingFrenzyReveal(actor, context = {})
    {
        return this.handleTrueAppearanceRevealTrigger(
            actor,
            TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.FEEDING_FRENZY,
            context
        )
    }

    static async handleHallowedGroundReveal(actor, context = {})
    {
        return this.handleTrueAppearanceRevealTrigger(
            actor,
            TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.HALLOWED_GROUND,
            context
        )
    }

    static async handleManualReveal(actor, context = {})
    {
        return this.handleTrueAppearanceRevealTrigger(
            actor,
            TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES.MANUAL_REVEAL,
            context
        )
    }

    static async callTrueAppearanceSave(
        actor,
        {
            triggerType = null,
            context = {}
        } = {}
    )
    {
        const item = this.resolveTrueAppearanceSaveItem(actor)
        if (!item) {
            this.warn("Skipping true appearance save: save item missing", {
                actorId: actor?.id ?? null,
                triggerType
            })
            return false
        }

        const activity = this.resolveTrueAppearanceSaveActivity(item)
        if (!activity || typeof activity.use !== "function") {
            this.warn("Skipping true appearance save: Midi Save activity missing", {
                actorId: actor?.id ?? null,
                itemId: item?.id ?? null,
                triggerType
            })
            return false
        }

        const saveDc = this.getTrueAppearanceSaveDc(actor)
        if (!Number.isFinite(saveDc)) {
            this.warn("Skipping true appearance save: save DC unavailable", {
                actorId: actor?.id ?? null,
                triggerType
            })
            return false
        }

        this.applyTrueAppearanceSaveDc({
            activity,
            item,
            activityId: this.resolveActivityId(activity),
            saveDc
        })

        await activity.use({
            actor,
            transformations: {
                vampire: {
                    triggerType,
                    ...context
                }
            }
        })

        return true
    }

    static shouldUpgradeStrigoiFangedBiteDamage({
        actor,
        item,
        activity,
        rollConfig
    } = {})
    {
        return this.actorHasItem(actor, STRIGOI_BLOODLINE_UUID) &&
            this.isFangedBiteMidiAttack({item, activity}) &&
            this.isRollConfigAdvantage(rollConfig)
    }

    static shouldUpgradeStrigoiFangedBiteDamageFromDamageContext({
        actor,
        item,
        activity,
        workflow = null,
        config = null
    } = {})
    {
        return this.actorHasItem(actor, STRIGOI_BLOODLINE_UUID) &&
            this.isFangedBiteMidiAttack({item, activity}) &&
            this.hasDamageContextAdvantage({workflow, config})
    }

    static resolveFangedBiteNecroticSaveDamageFormula(actor)
    {
        if (!this.actorHasItem(actor, SOMAN_BLOODLINE_UUID)) {
            return null
        }

        if (this.actorHasItem(actor, FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_UUID)) {
            return FANGED_BITE_NECROTIC_SAVE_3D8_OVERRIDE_FORMULA
        }

        return FANGED_BITE_NECROTIC_SAVE_SOMAN_DAMAGE_FORMULA
    }

    static shouldUpgradeFzegClawMidiAttackDamage({
        actor,
        item,
        activity,
        workflow = null,
        config = null
    } = {})
    {
        return this.actorHasItem(actor, FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_UUID) &&
            this.isFzegClawMidiAttackDamageContext({
                item,
                activity,
                workflow,
                config
            })
    }

    static actorHasItem(actor, sourceUuid)
    {
        return actor?.items?.some(item =>
            this.resolveSourceUuid(item) === sourceUuid
        ) ?? false
    }

    static matchesPendingStrigoiFangedBiteUpgrade(
        pendingUpgrade,
        {
            item,
            activity
        } = {}
    )
    {
        if (!pendingUpgrade) {
            return false
        }

        return pendingUpgrade.itemUuid === this.resolveSourceUuid(item) &&
            pendingUpgrade.activityId === this.resolveActivityId(activity)
    }

    static resolveActorKey(actor)
    {
        return actor?.uuid ??
            actor?.id ??
            null
    }

    static isFangedBiteMidiAttack({
        item,
        activity
    } = {})
    {
        const itemSourceUuid = this.resolveSourceUuid(item)
        const activityId = this.resolveActivityId(activity)
        const activityName = this.resolveActivityName(activity)

        return itemSourceUuid === FANGED_BITE_UUID &&
            (
                activityId === FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID ||
                activityName === FANGED_BITE_MIDI_ATTACK_ACTIVITY_NAME
            )
    }

    static isFangedBiteNecroticSaveDamageContext({
        item,
        activity,
        workflow = null,
        config = null
    } = {})
    {
        const itemSourceUuid = item?.flags?.transformations?.sourceUuid ?? null
        const activityName = this.resolveDamageContextActivityName({
            activity,
            workflow,
            config
        })

        return itemSourceUuid === FANGED_BITE_UUID &&
            activityName === FANGED_BITE_NECROTIC_SAVE_ACTIVITY_NAME
    }

    static isFzegClawMidiAttackDamageContext({
        item,
        activity,
        workflow = null,
        config = null
    } = {})
    {
        const itemSourceUuid = item?.flags?.transformations?.sourceUuid ?? null
        const activityName = this.resolveDamageContextActivityName({
            activity,
            workflow,
            config
        })

        return itemSourceUuid === FZEG_CLAW_UUID &&
            activityName === FZEG_CLAW_MIDI_ATTACK_ACTIVITY_NAME
    }

    static isRollConfigAdvantage(rollConfig = {})
    {
        return rollConfig?.advantage === true ||
            rollConfig?.options?.advantage === true ||
            rollConfig?.rollOptions?.advantage === true
    }

    static hasDamageContextAdvantage({
        workflow = null,
        config = null
    } = {})
    {
        return [
            workflow,
            workflow?.attackRoll,
            workflow?.attackConfig,
            workflow?.attackOptions,
            workflow?.options,
            workflow?.rollOptions,
            config,
            config?.workflow,
            config?.attackRoll,
            config?.attackConfig,
            config?.attackOptions,
            config?.options,
            config?.rollOptions
        ].some(candidate =>
            this.isRollConfigAdvantage(candidate)
        )
    }

    static resolveActivityFromAttackRollConfig(rollConfig = {})
    {
        return rollConfig?.subject?.activity ??
            rollConfig?.subject ??
            null
    }

    static resolveActivityId(activity)
    {
        return activity?.id ??
            activity?._id ??
            null
    }

    static resolveActivityName(activity)
    {
        return activity?.name ||
            activity?.macroData?.name ||
            ""
    }

    static resolveDamageContextActivityName({
        activity,
        workflow = null,
        config = null
    } = {})
    {
        return this.resolveActivityName(activity) ||
            this.resolveActivityName(workflow?.activity) ||
            this.resolveActivityName(config?.activity) ||
            this.resolveActivityName(config?.subject)
    }

    static resolveSourceUuid(document)
    {
        return document?.flags?.transformations?.sourceUuid ??
            document?.flags?.core?.sourceId ??
            document?._stats?.compendiumSource ??
            document?.uuid ??
            null
    }

    static resolveSourceUuids(document)
    {
        const sourceUuids = new Set()

        for (const candidate of [
            document?.flags?.transformations?.sourceUuid,
            document?.flags?.core?.sourceId,
            document?._stats?.compendiumSource,
            document?.uuid
        ])
        {
            if (typeof candidate !== "string" || candidate.length === 0) {
                continue
            }

            sourceUuids.add(candidate)
        }

        return sourceUuids
    }

    static resolveDocumentName(document)
    {
        return typeof document?.name === "string"
            ? document.name
            : ""
    }

    static resolveActorFromDocument(document)
    {
        return document?.actor ??
            document?.item?.actor ??
            document?.parent?.actor ??
            document?.parent?.parent?.actor ??
            document?.parent?.parent ??
            document?.parent ??
            null
    }

    static resolveActivityItem(activity, usage = null)
    {
        return usage?.workflow?.item ??
            usage?.item ??
            activity?.item ??
            activity?.parent?.parent ??
            activity?.parent ??
            usage?.workflow?.activity?.item ??
            usage?.workflow?.activity?.parent?.parent ??
            usage?.workflow?.activity?.parent ??
            null
    }

    static resolveTrueAppearanceSaveItem(actor)
    {
        return actor?.items?.find?.(item =>
            this.isTrueAppearanceSaveItem(item)
        ) ?? null
    }

    static resolveTrueAppearanceSaveActivity(item)
    {
        return this.resolveActivities(item).find(activity =>
            this.resolveActivityName(activity) === TRUE_APPEARANCE_SAVE_ACTIVITY_NAME
        ) ?? null
    }

    static resolveActivities(item)
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
            return Object.values(activities).filter(Boolean)
        }

        return []
    }

    static isTrueAppearanceSaveItem(document)
    {
        return this.resolveSourceUuid(document) === TRUE_APPEARANCE_SAVE_ITEM_UUID
    }

    static isTrueAppearanceSaveActivity({
        activity,
        usage = null
    } = {})
    {
        const item = this.resolveActivityItem(activity, usage)
        return this.isTrueAppearanceSaveItem(item) &&
            this.resolveActivityName(activity) === TRUE_APPEARANCE_SAVE_ACTIVITY_NAME
    }

    static isTrueAppearanceManualRevealActivity({
        activity,
        usage = null
    } = {})
    {
        const item = this.resolveActivityItem(activity, usage)
        if (!this.isTrueAppearanceSaveItem(item)) {
            return false
        }

        const activityName =
                  normalizeWhitespace(this.resolveActivityName(activity))
                  .toLowerCase()

        if (!activityName) {
            return false
        }

        if (TRUE_APPEARANCE_MANUAL_REVEAL_ACTIVITY_NAMES_NORMALIZED.has(
            activityName
        ))
        {
            return true
        }

        return activityName.includes("reveal") &&
            (
                activityName.includes("appearance") ||
                activityName.includes("yourself")
            )
    }

    static getTrueAppearanceSaveDc(actor)
    {
        return getTrueAppearanceSaveDcForStage(
            actor?.flags?.transformations?.stage ??
            actor?.getFlag?.("transformations", "stage") ??
            0
        )
    }

    static configureTrueAppearanceSaveDc({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        if (!actor || !this.isTrueAppearanceSaveActivity({
            activity,
            usage: usageConfig
        }))
        {
            return null
        }

        const saveDc = this.getTrueAppearanceSaveDc(actor)
        if (!Number.isFinite(saveDc)) {
            return null
        }

        this.applyTrueAppearanceSaveDc({
            activity,
            item: this.resolveActivityItem(activity, usageConfig),
            activityId: this.resolveActivityId(activity),
            usageConfig,
            dialogConfig,
            messageConfig,
            saveDc
        })

        return saveDc
    }

    static applyTrueAppearanceSaveDc({
        activity,
        item,
        activityId,
        usageConfig,
        dialogConfig,
        messageConfig,
        saveDc
    } = {})
    {
        this.applyPreparedSaveDc(activity, saveDc)
        this.persistPreparedSaveDc({
            item,
            activityId,
            saveDc
        })
        this.applyRootDcValue(usageConfig, saveDc)
        this.applyRootDcValue(dialogConfig, saveDc)
        this.applyRootDcValue(messageConfig, saveDc)
    }

    static applyPreparedSaveDc(target, saveDc)
    {
        if (!target || typeof target !== "object") return

        target.save ??= {}
        target.save.dc ??= {}
        target.save.dc.calculation = ""
        target.save.dc.formula = String(saveDc)
        target.save.dc.value = saveDc

        target.system ??= {}
        target.system.save ??= {}
        target.system.save.dc ??= {}
        target.system.save.dc.calculation = ""
        target.system.save.dc.formula = String(saveDc)
        target.system.save.dc.value = saveDc
    }

    static persistPreparedSaveDc({
        item,
        activityId,
        saveDc
    } = {})
    {
        if (!item || !activityId) return

        const value = String(saveDc)

        if (typeof item.updateSource === "function") {
            try {
                item.updateSource({
                    [`system.activities.${activityId}.save.dc.calculation`]: "",
                    [`system.activities.${activityId}.save.dc.formula`]: value
                })
            } catch {
            }
        }

        const refreshedActivity =
                  item?.system?.activities?.get?.(activityId) ??
                  null

        if (refreshedActivity) {
            this.applyPreparedSaveDc(refreshedActivity, saveDc)
        }
    }

    static applyRootDcValue(target, saveDc)
    {
        if (!target || typeof target !== "object") return

        target.dc ??= {}
        target.dc.value = saveDc
    }

    static isVampireTransformationActor(actor)
    {
        const transformationType =
                  actor?.flags?.transformations?.type ??
                  actor?.getFlag?.("transformations", "type") ??
                  null

        return transformationType === this.itemId ||
            actor?.getFlag?.("transformations", "vampire") != null ||
            actor?.flags?.transformations?.vampire != null
    }

    static hasNamedEffect(actor, effectName)
    {
        return this.resolveNamedEffect(actor, effectName) != null
    }

    static resolveNamedEffect(actor, effectName)
    {
        if (!effectName) return null

        const effects = actor?.effects ?? []

        if (typeof effects?.find === "function") {
            return effects.find(effect => effect?.name === effectName) ?? null
        }

        if (typeof effects?.values === "function") {
            for (const effect of effects.values()) {
                if (effect?.name === effectName) {
                    return effect
                }
            }
        }

        return null
    }

    static async removeHidingTrueAppearance(actor)
    {
        const effect = this.resolveNamedEffect(actor, TRUE_APPEARANCE_EFFECT_NAME)
        if (!effect) {
            return false
        }

        if (typeof effect.delete === "function") {
            await effect.delete()
            return true
        }

        if (
            typeof actor?.deleteEmbeddedDocuments === "function" &&
            effect?.id
        )
        {
            await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id])
            return true
        }

        this.warn("Skipping true appearance reveal: effect cannot be removed", {
            actorId: actor?.id ?? null,
            effectId: effect?.id ?? null
        })
        return false
    }

    static resolveDamageTypeMap(actor)
    {
        return actor?.getFlag?.("transformations", "damageTypePerMidiId") ??
            actor?.flags?.transformations?.damageTypePerMidiId ??
            {}
    }

    static resolveAppliedDamageType(actor, details)
    {
        const midiId = details?.midi?.sourceActorUuid ?? null
        if (!midiId) return null

        return this.resolveDamageTypeMap(actor)?.[midiId] ?? null
    }

    static isRadiantDamageFromSunlight({
        actor,
        details
    } = {})
    {
        if (this.resolveAppliedDamageType(actor, details) !== "radiant") {
            return false
        }

        return this.hasSunlightMarker(details)
    }

    static hasSunlightMarker(details = {})
    {
        for (const candidate of [
            details?.flags?.transformations?.sunlight,
            details?.flags?.transformations?.source,
            details?.activity?.flags?.transformations?.sunlight,
            details?.item?.flags?.transformations?.sunlight,
            details?.midi?.workflow?.activity?.flags?.transformations?.sunlight,
            details?.midi?.workflow?.item?.flags?.transformations?.sunlight,
            details?.sourceName,
            details?.flavor,
            details?.activity?.name,
            details?.item?.name,
            details?.midi?.workflow?.activity?.name,
            details?.midi?.workflow?.item?.name
        ])
        {
            if (candidate === true) {
                return true
            }

            if (
                typeof candidate === "string" &&
                candidate.toLowerCase().includes("sunlight")
            )
            {
                return true
            }
        }

        return false
    }

    static isSangromancyItem(document)
    {
        return this.resolveSourceUuid(document) === SANGROMANCY_ITEM_UUID
    }

    static getSangromancyHitDieFlag(actor)
    {
        if (typeof actor?.getFlag === "function") {
            return actor.getFlag(SANGROMANCY_FLAG_SCOPE, SANGROMANCY_FLAG_KEY)
        }

        return actor?.flags?.transformations?.vampire?.sangromancyHitDieMax ??
            null
    }

    static hasExistingSangromancyHitDieFlag(actor)
    {
        return this.isValidSangromancyHitDieTotal(
            this.getSangromancyHitDieFlag(actor)
        )
    }

    static resolveSangromancyPendingKey(actor)
    {
        return `${this.resolveActorKey(actor) ?? "unknown"}:${SANGROMANCY_FLAG_KEY}`
    }

    static isValidSangromancyHitDieTotal(value)
    {
        return Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 12
    }

    static async rollSangromancyHitDie(actor)
    {
        if (typeof globalThis.Roll !== "function") {
            this.warn("Skipping Sangromancy roll: Roll constructor unavailable")
            return null
        }

        const roll = await new globalThis.Roll(SANGROMANCY_HIT_DIE_FORMULA).roll()

        if (!this.isValidSangromancyHitDieTotal(roll?.total)) {
            return null
        }

        if (typeof roll?.toMessage !== "function") {
            this.warn("Skipping Sangromancy flag update: roll.toMessage unavailable")
            return null
        }

        await roll.toMessage({
            speaker: globalThis.ChatMessage?.getSpeaker?.({actor}) ?? null,
            flavor: SANGROMANCY_HIT_DIE_FLAVOR
        })

        return roll
    }

    static upgradeFangedBiteDamageRolls(rolls = [])
    {
        for (const roll of rolls) {
            if (!this.isPiercingDamageRoll(roll)) {
                continue
            }

            this.replaceDamageRollFormulaText(
                roll,
                FANGED_BITE_BASE_DAMAGE_FORMULA,
                FANGED_BITE_STRIGOI_DAMAGE_FORMULA
            )
        }
    }

    static upgradeFangedBiteNecroticSaveDamageRolls(
        rolls = [],
        damageFormula
    )
    {
        for (const roll of rolls) {
            this.replaceDamageRollFormulaText(
                roll,
                FANGED_BITE_BASE_DAMAGE_FORMULA,
                damageFormula
            )
        }
    }

    static upgradeFzegClawMidiAttackDamageRolls(rolls = [])
    {
        for (const roll of rolls) {
            this.replaceDamageRollFormulaText(
                roll,
                FZEG_CLAW_BASE_DAMAGE_FORMULA,
                FZEG_CLAW_MIDI_ATTACK_3D6_OVERRIDE_FORMULA
            )
        }
    }

    static replaceDamageRollFormulaText(roll, fromFormula, toFormula)
    {
        this.replaceDamageRollFormulaField(roll, "formula", fromFormula, toFormula)
        this.replaceDamageRollFormulaField(roll, "_formula", fromFormula, toFormula)

        if (Array.isArray(roll?.parts)) {
            roll.parts = roll.parts.map(part =>
                this.replaceDamageFormulaText(part, fromFormula, toFormula)
            )
        }
    }

    static replaceDamageRollFormulaField(roll, key, fromFormula, toFormula)
    {
        if (typeof roll?.[key] !== "string") return

        roll[key] = this.replaceDamageFormulaText(
            roll[key],
            fromFormula,
            toFormula
        )
    }

    static isPiercingDamageRoll(roll)
    {
        const damageTypes = roll?.options?.types

        if (Array.isArray(damageTypes)) {
            return damageTypes.includes("piercing")
        }

        if (typeof damageTypes?.has === "function") {
            return damageTypes.has("piercing")
        }

        return true
    }

    static replaceDamageFormulaText(
        text,
        fromFormula = FANGED_BITE_BASE_DAMAGE_FORMULA,
        toFormula   = FANGED_BITE_STRIGOI_DAMAGE_FORMULA
    )
    {
        if (typeof text !== "string") return text

        return text.replace(
            new RegExp(`\\b${fromFormula}\\b`, "u"),
            toFormula
        )
    }

    static warn(message, details = null)
    {
        if (details == null) {
            console.warn(`Transformations | Vampire: ${message}`)
            return
        }

        console.warn(`Transformations | Vampire: ${message}`, details)
    }

    static error(message, error)
    {
        console.error(`Transformations | Vampire: ${message}`, error)
    }
}

function normalizeWhitespace(value)
{
    return String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim()
}
