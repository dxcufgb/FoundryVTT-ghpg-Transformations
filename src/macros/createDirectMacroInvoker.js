export function createDirectMacroInvoker({
    macroRegistry,
    activeEffectRepository,
    itemRepository,
    logger
}) {
    async function invoke({
        transformationType,
        action,
        actor,
        context
    }) {
        const entry = macroRegistry.get(transformationType);
        if (!entry) {
            throw new Error(`Unknown transformation: ${transformationType}`);
        }

        const handlers = entry.createHandlers({
            logger,
            activeEffectRepository,
            itemRepository
        });

        const handler = handlers[action];
        if (typeof handler !== "function") {
            throw new Error(
                `Handler '${action}' not found for ${transformationType}`
            );
        }

        return handler({
            actor,
            trigger: context.trigger,
            context
        });
    }

    return Object.freeze({ invoke });
}
