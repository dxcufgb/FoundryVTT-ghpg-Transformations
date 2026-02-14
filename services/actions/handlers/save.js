// services/actions/save.js

import { resolveValue } from "../utils/resolveValue.js"

export function createSaveAction({
    tracker,
    logger
})
{
    logger.debug("createSaveAction", { tracker })

    return async function SAVE_ACTION({
        actor,
        action,
        context
    })
    {
        logger.debug("createSaveAction.SAVE_ACTION", {
            actor,
            action,
            context
        })
        const { ability, dc, key } = action.data ?? {}

        if (!ability || !key) {
            logger.warn("SAVE action missing ability or key", action)
            return
        }

        // Resolve DC (supports formulas like "@prof + @transformation.stage")
        const resolvedDC = resolveValue(dc, context)

        if (!Number.isFinite(resolvedDC)) {
            logger.warn("SAVE action has invalid DC", dc)
            return
        }

        logger.debug(
            "Executing SAVE action",
            actor.id,
            ability,
            resolvedDC,
            key
        )

        return tracker.track(
            (async () =>
            {
                const roll = await actor.rollAbilitySave(
                    ability,
                    {
                        dc: resolvedDC,
                        chatMessage: true,
                        fastForward: false
                    }
                )

                if (!roll) return

                const success = roll.total >= resolvedDC

                // Store result in context for downstream actions
                context.saves ??= {}
                context.saves[key] = {
                    ability,
                    dc: resolvedDC,
                    total: roll.total,
                    success
                }

                logger.debug(
                    "SAVE result",
                    key,
                    success ? "SUCCESS" : "FAILURE",
                    roll.total
                )
            })()
        )
    }
}
