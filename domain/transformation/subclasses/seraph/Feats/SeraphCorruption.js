export const SERAPH_CORRUPTION_ITEM_UUID =
                 "Compendium.transformations.gh-transformations.Item.nbEepKdcM50RJvbI"
export const SERAPH_CORRUPTION_EFFECT_UUID =
                 `${SERAPH_CORRUPTION_ITEM_UUID}.ActiveEffect.jtTKgErRNcmd9Ewh`

export const SERAPH_CORRUPTION_EFFECT_NAME = "seraph corruption"

// Read by the midi-qol condition on the Seraph Corruption effect
// (flags.midi-qol.disadvantage.attack.all) to limit the Disadvantage to the
// first attack of each round.
export const SERAPH_CORRUPTION_ATTACK_ROUND_FLAG = "seraph.corruptionAttackRound"

// "<effect id>:<combat id>:<round>" of the last spell save the corrupted
// Seraph gave Advantage to. Kept on the Seraph actor so every client sees it:
// the save hook runs on the client of the creature making the save.
export const SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG = "seraph.corruptionSpellSaveRound"

// Local cache of the same key, covering the moment between granting the
// Advantage and the flag update coming back from the server.
const spellSaveAdvantageRoundByActor = new Map()

/**
 * Seraph Corruption (Stage 4 flaw). The over-time Psychic damage and the
 * healing / Temporary Hit Point immunity live on the compendium effect; this
 * class handles the once-per-round parts that need roll context.
 */
export class SeraphCorruption
{
    static isCorruptionEffect(effect)
    {
        if (!effect) return false

        return resolveEffectSourceUuids(effect).has(SERAPH_CORRUPTION_EFFECT_UUID) ||
            String(effect?.name ?? "").trim().toLowerCase() ===
            SERAPH_CORRUPTION_EFFECT_NAME
    }

    static findActiveCorruptionEffect(actor)
    {
        const effects = actor?.appliedEffects ?? actor?.effects ?? []

        for (const effect of effects) {
            if (effect?.disabled || effect?.isSuppressed) continue
            if (this.isCorruptionEffect(effect)) return effect
        }

        return null
    }

    static getCombatRound()
    {
        return Number(globalThis.game?.combat?.round ?? 0) || 0
    }

    /**
     * The flag written here must match the one read by the effect's midi-qol
     * condition, which compares it against the current combat round.
     */
    static async recordAttack(actor)
    {
        if (!actor?.isOwner) return false
        if (!this.findActiveCorruptionEffect(actor)) return false

        const round = this.getCombatRound()
        const current = foundry.utils.getProperty(
            actor,
            `flags.transformations.${SERAPH_CORRUPTION_ATTACK_ROUND_FLAG}`
        )
        if (current === round) return false

        await actor.setFlag("transformations", SERAPH_CORRUPTION_ATTACK_ROUND_FLAG, round)
        return true
    }

    static isSpellSave(context)
    {
        const workflow = context?.workflow ?? null
        const item =
                  workflow?.saveItem ??
                  workflow?.item ??
                  resolveOriginatingMessageItem(context) ??
                  null

        return item?.type === "spell"
    }

    /**
     * Once per round, the first creature the corrupted Seraph forces to make
     * a saving throw against one of its spells has Advantage on it.
     */
    static applySpellSaveAdvantage(context, attacker, data = {})
    {
        const effect = this.findActiveCorruptionEffect(attacker)
        if (!effect || !context) return false
        if (!this.isSpellSave(context)) return false

        const roundKey = this.getSpellSaveRoundKey(effect)
        const actorKey = attacker?.uuid ?? attacker?.id
        if (!actorKey || spellSaveAdvantageRoundByActor.get(actorKey) === roundKey) return false
        if (this.getRecordedSpellSaveRoundKey(attacker) === roundKey) return false

        spellSaveAdvantageRoundByActor.set(actorKey, roundKey)
        this.recordSpellSaveRound(attacker, roundKey).catch(error =>
            globalThis.game?.transformations?.logger?.warn?.(
                "Seraph Corruption: could not record the spell save round",
                error
            )
        )

        const hasDisadvantage =
                  context.disadvantage === true ||
                  context.rolls?.some(roll => roll.options?.disadvantage === true)

        context.advantage = true
        context.rolls?.forEach(roll =>
        {
            roll.options ??= {}
            roll.options.advantage = true
        })

        // The roll dialog highlights its default button from the dialog
        // options, which are computed before this hook runs.
        if (data.dialog) {
            const ADV_MODE = CONFIG.Dice.D20Roll.ADV_MODE

            data.dialog.options ??= {}
            data.dialog.options.advantageMode = hasDisadvantage
                ? ADV_MODE.NORMAL
                : ADV_MODE.ADVANTAGE
            data.dialog.options.defaultButton = hasDisadvantage
                ? "normal"
                : "advantage"
        }

        return true
    }

    static getSpellSaveRoundKey(effect)
    {
        const combat = globalThis.game?.combat ?? null
        return `${effect?.id ?? "none"}:${combat?.id ?? "none"}:${this.getCombatRound()}`
    }

    static getRecordedSpellSaveRoundKey(actor)
    {
        return foundry.utils.getProperty(
            actor ?? {},
            `flags.transformations.${SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG}`
        ) ?? null
    }

    /**
     * The saving creature's client usually can't update the Seraph, so the
     * write goes through the GM in that case.
     */
    static async recordSpellSaveRound(actor, roundKey)
    {
        if (!actor) return false

        if (actor.isOwner) {
            await actor.setFlag("transformations", SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG, roundKey)
            return true
        }

        const socket = globalThis.MidiQOL?.socket?.() ?? null
        if (!socket?.executeAsGM) return false

        await socket.executeAsGM("updateActor", {
            actorUuid: actor.uuid,
            updates: {
                [`flags.transformations.${SERAPH_CORRUPTION_SPELL_SAVE_ROUND_FLAG}`]: roundKey
            }
        })
        return true
    }

    /**
     * A new Seraph Corruption starts clean: no Temporary Hit Points and no
     * attack or spell save recorded for the current round.
     */
    static async onCorruptionApplied(actor)
    {
        if (!actor) return

        spellSaveAdvantageRoundByActor.delete(actor.uuid ?? actor.id)

        const updates = {
            "flags.transformations.seraph.-=corruptionAttackRound": null,
            "flags.transformations.seraph.-=corruptionSpellSaveRound": null
        }
        if (Number(actor.system?.attributes?.hp?.temp ?? 0) > 0) {
            updates["system.attributes.hp.temp"] = 0
        }

        await actor.update(updates)
    }

    static resetSpellSaveTracking()
    {
        spellSaveAdvantageRoundByActor.clear()
    }
}

export function resolveEffectSourceUuids(effect)
{
    const sourceUuids = new Set()

    for (const candidate of [
        effect?.flags?.transformations?.sourceUuid,
        effect?.getFlag?.("transformations", "sourceUuid"),
        effect?.flags?.transformations?.grantedBy?.sourceUuid,
        effect?.getFlag?.("transformations", "grantedBy")?.sourceUuid,
        effect?.flags?.core?.sourceId,
        effect?._stats?.compendiumSource,
        effect?.origin,
        effect?.uuid
    ]) {
        if (typeof candidate === "string" && candidate.length > 0) {
            sourceUuids.add(candidate)
        }
    }

    return sourceUuids
}

function resolveOriginatingMessageItem(context)
{
    const messageId =
              context?.data?.flags?.dnd5e?.originatingMessage ??
              context?.flags?.dnd5e?.originatingMessage ??
              null
    if (!messageId) return null

    const message = globalThis.game?.messages?.get?.(messageId)
    return message?.getAssociatedItem?.() ?? null
}
