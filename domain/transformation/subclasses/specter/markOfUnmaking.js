/**
 * Call of Unmaking (Specter, Stage 4 Boon): a creature bearing the Mark of
 * Unmaking takes an additional 1d6 Necrotic damage each time it takes damage.
 *
 * dnd5e fires `dnd5e.applyDamage` only on the client that applied the damage
 * (midi-qol applies its damage through Actor5e#applyDamage as well), so the
 * extra damage is rolled and applied exactly once. The extra damage is applied
 * with MARK_OF_UNMAKING_OPTION set, which stops it from triggering the mark again.
 */
export const MARK_OF_UNMAKING_EFFECT_NAME = "Mark of Unmaking"
export const MARK_OF_UNMAKING_FORMULA = "1d6"
export const MARK_OF_UNMAKING_DAMAGE_TYPE = "necrotic"
export const MARK_OF_UNMAKING_OPTION = "transformationsMarkOfUnmaking"

const REGISTERED = Symbol.for("transformations.specter.markOfUnmakingHooks")

function resolveActorEffects(actor)
{
    const effects = typeof actor?.allApplicableEffects === "function"
        ? Array.from(actor.allApplicableEffects())
        : Array.from(actor?.effects ?? [])

    return effects.filter(Boolean)
}

export function findMarkOfUnmakingEffect(actor, logger = null)
{
    logger?.debug?.("findMarkOfUnmakingEffect", { actor })
    return resolveActorEffects(actor).find(effect =>
        !effect.disabled &&
        !effect.isSuppressed &&
        (
            effect.name === MARK_OF_UNMAKING_EFFECT_NAME ||
            effect.flags?.transformations?.markOfUnmaking === true
        )
    ) ?? null
}

export function shouldTriggerMarkOfUnmaking(actor, amount, options = {}, logger = null)
{
    logger?.debug?.("shouldTriggerMarkOfUnmaking", { actor, amount, options })
    if (!actor) return false
    if (options?.[MARK_OF_UNMAKING_OPTION]) return false
    if (!Number.isFinite(amount) || amount <= 0) return false

    return !!findMarkOfUnmakingEffect(actor, logger)
}

export async function applyMarkOfUnmaking(actor, {
    rollFactory = formula => new globalThis.Roll(formula),
    createMessage = true,
    logger = null
} = {})
{
    logger?.debug?.("applyMarkOfUnmaking", { actor })
    const roll = rollFactory(`${MARK_OF_UNMAKING_FORMULA}[${MARK_OF_UNMAKING_DAMAGE_TYPE}]`)
    await roll.evaluate()

    const value = Number(roll.total) || 0
    if (value <= 0) return { roll, value }

    if (createMessage && typeof roll.toMessage === "function") {
        await roll.toMessage({
            speaker: globalThis.ChatMessage?.getSpeaker?.({ actor }) ?? {},
            flavor: `${MARK_OF_UNMAKING_EFFECT_NAME}: ${actor.name} takes an additional ` +
                `${value} Necrotic damage.`
        })
    }

    await actor.applyDamage(
        [{ value, type: MARK_OF_UNMAKING_DAMAGE_TYPE }],
        { [MARK_OF_UNMAKING_OPTION]: true }
    )

    return { roll, value }
}

export async function handleMarkOfUnmakingDamage(actor, amount, options = {}, {
    rollFactory,
    createMessage = true,
    logger = null
} = {})
{
    logger?.debug?.("handleMarkOfUnmakingDamage", { actor, amount, options })
    if (!shouldTriggerMarkOfUnmaking(actor, amount, options, logger)) return null

    return applyMarkOfUnmaking(actor, { rollFactory, createMessage, logger })
}

export function registerMarkOfUnmakingHooks({
    hooks = globalThis.Hooks,
    logger = null
} = {})
{
    logger?.debug?.("registerMarkOfUnmakingHooks", {})
    if (typeof hooks?.on !== "function") return false
    if (globalThis[REGISTERED]) return false
    globalThis[REGISTERED] = true

    hooks.on("dnd5e.applyDamage", (actor, amount, options) =>
    {
        handleMarkOfUnmakingDamage(actor, amount, options, { logger })
            .catch(error =>
            {
                if (logger?.warn) logger.warn("Mark of Unmaking damage failed", error)
                else console.warn("Transformations | Mark of Unmaking damage failed", error)
            })
    })

    return true
}
