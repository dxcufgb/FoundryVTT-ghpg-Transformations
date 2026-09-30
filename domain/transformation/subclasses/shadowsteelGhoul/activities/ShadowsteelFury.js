// Shadowsteel Fury (Stage 4): the bonus-action extra attack lives on the Cursed Claw weapon and, through the
// Shadowsteel Weapon enchantment riders, on the imbued weapon. On a hit Midi runs the paired save activity
// (found by its identifier), whose DC is 8 + the ability modifier used for the attack + Transformation Stage.
export const SHADOWSTEEL_FURY_FEAT_IDENTIFIER = "shadowsteel-fury"
export const SHADOWSTEEL_FURY_ATTACK_IDENTIFIER = "shadowsteel-fury-attack"
export const SHADOWSTEEL_FURY_SAVE_IDENTIFIER = "shadowsteel-fury-save"
export const SHADOWSTEEL_FURY_ATTACK_NAME = "Shadowsteel Fury Attack"
export const SHADOWSTEEL_FURY_SAVE_NAME = "Shadowsteel Fury Save"

const DEFAULT_ATTACK_ABILITY = "str"

export class ShadowsteelFury
{
    static onPreUseActivity({
        activity,
        actor,
        logger
    } = {})
    {
        logger?.debug?.("ShadowsteelFury.onPreUseActivity", {activity, actor})
        if (!actor || !activity) return false
        if (!this.isFuryAttackActivity(activity)) return false

        const item = activity.item ?? activity.parent?.parent ?? null
        const saveActivity = this.findFurySaveActivity(item)
        if (!saveActivity) {
            logger?.warn?.("Shadowsteel Fury attack has no paired save activity", item?.name)
            return false
        }

        const formula = this.buildSaveDcFormula(this.resolveAttackAbility(activity))
        this.applySaveDcFormula({
            item,
            activity,
            saveActivity,
            formula,
            logger
        })

        return true
    }

    static matchesActivity(activity, identifier, name)
    {
        if (!activity || typeof activity !== "object") return false

        return (
            activity.midiProperties?.identifier === identifier ||
            activity.name === name
        )
    }

    static isFuryAttackActivity(activity)
    {
        return (
            activity?.type === "attack" &&
            this.matchesActivity(
                activity,
                SHADOWSTEEL_FURY_ATTACK_IDENTIFIER,
                SHADOWSTEEL_FURY_ATTACK_NAME
            )
        )
    }

    static isFurySaveActivity(activity)
    {
        return (
            activity?.type === "save" &&
            this.matchesActivity(
                activity,
                SHADOWSTEEL_FURY_SAVE_IDENTIFIER,
                SHADOWSTEEL_FURY_SAVE_NAME
            )
        )
    }

    static findFurySaveActivity(item)
    {
        const activities = item?.system?.activities
        if (!activities) return null

        const list = typeof activities.values === "function"
            ? Array.from(activities.values())
            : Object.values(activities)

        return list.find(candidate => this.isFurySaveActivity(candidate)) ?? null
    }

    // The attack activity's ability getter already resolves finesse weapons to the higher of Str/Dex.
    static resolveAttackAbility(activity)
    {
        const abilities = globalThis.CONFIG?.DND5E?.abilities
        let ability = null
        try {
            ability = activity?.ability ?? null
        } catch {
            ability = null
        }

        if (typeof ability !== "string" || ability.length === 0) return DEFAULT_ATTACK_ABILITY
        if (abilities && !(ability in abilities)) return DEFAULT_ATTACK_ABILITY

        return ability
    }

    static buildSaveDcFormula(ability = DEFAULT_ATTACK_ABILITY)
    {
        return `8 + @abilities.${ability}.mod + @flags.transformations.stage`
    }

    static applySaveDcFormula({
        item,
        activity,
        saveActivity,
        formula,
        logger
    } = {})
    {
        logger?.debug?.("ShadowsteelFury.applySaveDcFormula", {item, saveActivity, formula})
        const saveId = saveActivity.id ?? saveActivity._id

        if (saveId && typeof item?.updateSource === "function") {
            try {
                item.updateSource({
                    [`system.activities.${saveId}.save.dc.calculation`]: "",
                    [`system.activities.${saveId}.save.dc.formula`]: formula
                })
            } catch (error) {
                logger?.warn?.("Could not store the Shadowsteel Fury save DC on the item", error)
            }
        }

        let cachedOther = null
        try {
            cachedOther = activity?.otherActivity ?? null
        } catch {
            cachedOther = null
        }

        const targets = new Set([
            saveActivity,
            this.findFurySaveActivity(item),
            this.isFurySaveActivity(cachedOther) ? cachedOther : null
        ].filter(Boolean))

        for (const target of targets) {
            this.applyPreparedFormula(target, formula, logger)
        }
    }

    static applyPreparedFormula(saveActivity, formula, logger)
    {
        if (!saveActivity?.save?.dc) return

        saveActivity.save.dc.calculation = ""
        saveActivity.save.dc.formula = formula

        if (typeof saveActivity.prepareFinalData !== "function") return
        try {
            saveActivity.prepareFinalData()
        } catch (error) {
            logger?.warn?.("Could not prepare the Shadowsteel Fury save DC", error)
        }
    }
}
