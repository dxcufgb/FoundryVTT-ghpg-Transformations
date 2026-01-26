// services/actions/macroAction.js

export function createMacroAction({
    directMacroInvoker,
    logger
}) {
    return async function MACRO({
        actor,
        action,
        context,
        variables
    }) {
        const data = action.data;

        if (!data?.transformationType || !data?.action) {
            logger.warn(
                "Invalid MACRO action payload",
                action
            );
            return;
        }

        logger.debug(
            "Executing MACRO action",
            data.transformationType,
            data.action,
            context.trigger
        );

        await directMacroInvoker.invoke({
            actor,
            transformationType: data.transformationType,
            action: data.action,
            context: {
                actorUuid: actor.uuid,
                ...data.args,
                ...variables,
                ...context
            }
        });
    };
}
