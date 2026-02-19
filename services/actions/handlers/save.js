// services/actions/save.js

import { resolveValue } from "../utils/resolveValue.js"

export function createSaveAction({
    tracker,
    logger,
})
{
    logger.debug("createSaveAction", { tracker })

    return async function SAVE_ACTION({
        actor,
        action,
        context,
        variables
    })
    {
        const { ability, dc, key } = action.data ?? {}

        if (!ability || !key) {
            logger.warn("SAVE action missing ability or key", action)
            return false
        }

        const resolvedDC = resolveValue(dc, context, variables)

        if (!Number.isFinite(resolvedDC)) {
            logger.warn("SAVE action has invalid DC", dc)
            return false
        }

        return tracker.track(
            (async () =>
            {
                const roll = await executeSave(actor, ability, {
                    dc: resolvedDC,
                    chatMessage: true,
                    fastForward: false
                })

                if (!roll) return false

                const success = roll.total >= resolvedDC

                context.saves ??= {}
                context.saves[key] = {
                    ability,
                    dc: resolvedDC,
                    total: roll.total,
                    success
                }

                return true
            })()
        )
    }
}


// 👇 Production default (unchanged behavior)
async function executeSave(actor, ability, options)
{
    if (globalThis.__TRANSFORMATIONS_TEST__ === true) {
        globalThis.___TransformationTestEnvironment___.saveRolled = true
        return { total: globalThis.___TransformationTestEnvironment___?.saveResult }
    }

    if (typeof actor.rollAbilitySave !== "function") {
        return null
    }

    return actor.rollAbilitySave(ability, options)
}
