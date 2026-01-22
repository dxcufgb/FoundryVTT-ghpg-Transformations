import * as subclasses from "../domain/transformation/subclasses/index.js";

export function registerTransformationMacros({
    macroRegistry,
    logger
}) {
    for (const subclass of Object.values(subclasses)) {
        const handlers = subclass.handlers;
        if (!handlers?.type || !handlers?.createMacroHandlers) {
            logger.warn(
                "Invalid transformation subclass macro export",
                handlers
            );
            continue;
        }

        macroRegistry.register({
            type: handlers.type,
            createHandlers: handlers.createMacroHandlers
        });
    }
}
