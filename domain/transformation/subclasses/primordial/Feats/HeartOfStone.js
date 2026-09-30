// Heart of Stone: "While a creature has Temporary Hit Points gained in this manner, they cannot
// have the Prone condition". The applied effect (Prone immunity) must go away with those temp HP,
// otherwise any later temp HP from another source would re-enable it through its enableCondition.
export const HEART_OF_STONE_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.esO6UI1o9ZRlMn2W"
export const HEART_OF_STONE_EFFECT_NAME = "Heart of Stone"

const TEMP_HP_PATH = "system.attributes.hp.temp"

export class HeartOfStone
{
    static isHeartOfStoneEffect(effect)
    {
        if (!effect) return false
        if (effect.flags?.transformations?.heartOfStone === true) return true
        if (effect.name !== HEART_OF_STONE_EFFECT_NAME) return false

        return (effect.changes ?? []).some(change =>
            change?.key === "system.traits.ci.value" &&
            String(change?.value ?? "").trim().toLowerCase() === "prone"
        )
    }

    static didChangeTempHp(changed)
    {
        if (!changed) return false
        if (Object.prototype.hasOwnProperty.call(changed, TEMP_HP_PATH)) return true

        return changed?.system?.attributes?.hp != null &&
            Object.prototype.hasOwnProperty.call(changed.system.attributes.hp, "temp")
    }

    static hasTempHp(actor)
    {
        const temp = Number(actor?.system?.attributes?.hp?.temp ?? 0)
        return Number.isFinite(temp) && temp > 0
    }

    static getExpiredEffects(actor)
    {
        if (!actor || this.hasTempHp(actor)) return []

        const effects = actor.effects?.contents ?? [...(actor.effects ?? [])]
        return effects.filter(effect =>
            // Only effects applied to the creature, never the item's own (non-transfer) effect
            !(effect?.parent?.documentName === "Item") &&
            this.isHeartOfStoneEffect(effect)
        )
    }

    /**
     * Call from an updateActor hook (GM side). Removes the Heart of Stone Prone immunity from
     * any creature whose temporary hit points have just dropped to 0.
     */
    static async removeIfTempHpDepleted({
        actor,
        changed,
        logger
    } = {})
    {
        logger?.debug?.("HeartOfStone.removeIfTempHpDepleted", {actor, changed})
        if (changed && !this.didChangeTempHp(changed)) return false

        const expired = this.getExpiredEffects(actor)
        if (expired.length === 0) return false

        await actor.deleteEmbeddedDocuments(
            "ActiveEffect",
            expired.map(effect => effect.id)
        )

        return true
    }
}
