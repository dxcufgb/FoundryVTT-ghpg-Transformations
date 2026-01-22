export async function applyActions(
    { actorId, actions, context, variables },
    { actorRepository, effectService, rollTableService },
    { logger }
) {
    const actor = actorRepository.getById(actorId);
    if (!actor) return;

    if (!Array.isArray(actions) || actions.length === 0) {
        return;
    }

    for (const action of actions) {
        const handler = ACTION_HANDLERS[action.type];

        if (!handler) {
            logger.warn(
                "Unknown action type",
                action.type,
                action
            );
            continue;
        }

        await handler({
            actor,
            action,
            context,
            variables,
            services: {
                effectService,
                rollTableService
            },
            logger
        });
    }
}

const ACTION_HANDLERS = Object.freeze({

    APPLY_EFFECT: async ({
        actor,
        action,
        context,
        services
    }) => {
        await services.effectService.applyEffect(
            actor,
            action.data,
            context
        );
    },

    REMOVE_ACTIVE_EFFECTS: async ({
        actor,
        context,
        services
    }) => {
        await services.effectService.removeEffectsBySource(
            actor,
            context.trigger
        );
    },

    APPLY_ROLLTABLE: async ({
        actor,
        action,
        context,
        services
    }) => {
        const result =
            await services.rollTableService.roll(
                action.data.table,
                context
            );

        if (!result) return;

        await services.effectService.applyEffect(
            actor,
            result.effect,
            context
        );
    },

    CLEAR_TRANSFORMATION_EFFECTS: async ({
        actor,
        services
    }) => {
        await services.effectService.removeEffectsBySource(
            actor,
            "transformation"
        );
    }

});
