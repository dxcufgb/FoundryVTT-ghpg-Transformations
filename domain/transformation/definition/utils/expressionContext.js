import { resolveExpression } from "../utils/resolveExpression.js";
/**
 * Build a nested expression context object.
 * This is the ONLY place allowed to read actor data.
 */
export function buildExpressionContext(actor, context = {}) {
    const base = {
        // ───────── Flat aliases (backward compatibility) ─────────
        stage: context?.stage ?? 1,
        prof: actor.system?.attributes?.prof ?? 0,
        level:
            actor.system?.details?.level ??
            actor.system?.details?.levels?.level ??
            1,

        // ───────── Namespaced: transformation ─────────
        transformation: {
            stage: context?.stage ?? 1
        },

        // ───────── Namespaced: actor ─────────
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

        // ───────── Namespaced: flags ─────────
        flags: {
            dnd5e: {
                transformationStage:
                    actor.flags?.dnd5e?.transformationStage ?? 1
            },
            transformations: {
                id: actor.flags?.dnd5e?.transformations ?? null
            }
        }
    };

    if (context?.derived) {
        for (const [key, expr] of Object.entries(context.derived)) {
            base[key] = resolveExpression(expr, base);
        }
    }

    return base;
}
