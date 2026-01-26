// services/actions/rollTable.js

export function createRollTableAction({
    rollTableService,
    rollTableEffectResolver,
    logger
}) {
    return async function APPLY_ROLLTABLE({
        actor,
        action,
        context
    }) {
        const outcome = await rollTableService.roll({
            uuid: action.data.uuid,
            mode: action.data.mode,
            context
        });

        if (!outcome || !outcome.effectKey) return;

        const effect = rollTableEffectResolver.resolve({
            actor,
            effectKey: outcome.effectKey
        });

        if (!effect) {
            logger.warn(
                "No roll table effect resolved",
                outcome
            );
            return;
        }

        await effect.apply();
    };
}
