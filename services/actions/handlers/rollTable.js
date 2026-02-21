// services/actions/rollTable.js

export function createRollTableAction({
    rollTableService,
    rollTableEffectResolver,
    tracker,
    logger
})
{
    logger.debug("createRollTableAction", {
        rollTableService,
        rollTableEffectResolver,
        tracker
    })

    return async function APPLY_ROLLTABLE({
        actor,
        action,
        context
    })
    {
        logger.debug("createRollTableAction.APPLY_ROLLTABLE", {
            actor,
            action,
            context
        })
        return tracker.track(
            (async () =>
            {
                const currentRollTableEffectLowRange = await actor.getFlag("transformations", "currentRollTableEffectLowRange")

                const outcome = await rollTableService.roll({
                    uuid: action.data.uuid,
                    mode: action.data.mode,
                    context: {
                        ...context,
                        currentRollTableEffectLowRange
                    }
                })

                if (!outcome || !outcome.effectKey) return

                await actor.setFlag("transformations", "currentRollTableEffectLowRange", outcome.result.range[0])

                const effect = rollTableEffectResolver.resolve({
                    actor,
                    effectKey: outcome.effectKey
                })

                if (!effect) {
                    logger.warn(
                        "No roll table effect resolved",
                        outcome
                    )
                    return
                }

                await effect.apply()
            })()
        )
    }
}
