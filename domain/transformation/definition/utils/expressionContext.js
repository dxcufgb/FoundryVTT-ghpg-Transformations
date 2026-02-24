import { resolveExpression } from "../utils/resolveExpression.js"
/**
 * Build a nested expression context object.
 * This is the ONLY place allowed to read actor data.
 */
export function buildExpressionContext(actor, context = {})
{
    context?.logger?.debug?.("buildExpressionContext", { actor, context })
    const base = {
        stage: context?.stage ?? 0,
        prof: actor.system?.attributes?.prof ?? 0,
        level:
            actor.system?.details?.level ??
            actor.system?.details?.levels?.level ??
            1,

        actor: {
            name: actor.name,
            hp: actor.system?.attributes?.hp?.value ?? 0,
            maxHp: actor.system?.attributes?.hp?.max ?? 0,
            tempHp: actor.system?.attributes?.hp?.temp ?? 0,
            level:
                actor.system?.details?.level ??
                actor.system?.details?.levels?.level ??
                1
        },

        flags: {
            transformations: {
                stage:
                    actor.flags?.transformations?.stage ?? 0,
                type:
                    actor.flags?.transformations?.type ?? null
            }
        }
    }

    if (context?.derived) {
        for (const [key, expr] of Object.entries(context.derived)) {
            base[key] = resolveExpression(expr, base)
        }
    }

    return base
}
