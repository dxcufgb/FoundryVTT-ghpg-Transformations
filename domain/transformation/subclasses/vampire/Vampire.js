import { Transformation } from "../../Transformation.js"

const FANGED_BITE_UUID =
    "Compendium.transformations.gh-transformations.Item.TreKDUe7BregxPRU"
const STRIGOI_BLOODLINE_UUID =
    "Compendium.transformations.gh-transformations.Item.HjL4gLx90PsSkSK7"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_ID = "ddjFKkSGslAQQjB4"
const FANGED_BITE_MIDI_ATTACK_ACTIVITY_NAME = "Midi Attack"
const FANGED_BITE_STRIGOI_DAMAGE_FORMULA = "2d4"
const FANGED_BITE_BASE_DAMAGE_FORMULA = "1d6"

const pendingStrigoiFangedBiteUpgrade = new Map()

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
        })) {
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
        ) {
            return
        }

        this.upgradeFangedBiteDamageRolls(rolls)
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

    static resolveSourceUuid(document)
    {
        return document?.flags?.transformations?.sourceUuid ??
            document?.flags?.core?.sourceId ??
            document?._stats?.compendiumSource ??
            document?.uuid ??
            null
    }

    static upgradeFangedBiteDamageRolls(rolls = [])
    {
        for (const roll of rolls) {
            if (!this.isPiercingDamageRoll(roll)) {
                continue
            }

            this.replaceBaseFangedBiteDamageFormula(roll, "formula")
            this.replaceBaseFangedBiteDamageFormula(roll, "_formula")

            if (Array.isArray(roll?.parts)) {
                roll.parts = roll.parts.map(part =>
                    this.replaceDamageFormulaText(part)
                )
            }
        }
    }

    static replaceBaseFangedBiteDamageFormula(roll, key)
    {
        if (typeof roll?.[key] !== "string") return

        roll[key] = this.replaceDamageFormulaText(roll[key])
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

    static replaceDamageFormulaText(text)
    {
        if (typeof text !== "string") return text

        return text.replace(
            new RegExp(`\\b${FANGED_BITE_BASE_DAMAGE_FORMULA}\\b`, "u"),
            FANGED_BITE_STRIGOI_DAMAGE_FORMULA
        )
    }
}
