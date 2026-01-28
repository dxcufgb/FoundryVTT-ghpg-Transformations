import * as subclasses from "../domain/transformation/subclasses/index.js";
import { createGeneralHandlers } from "../macros/createGeneralHandlers.js";

export function registerTransformationMacros({
    macroRegistry,
    logger
}) {
    macroRegistry.register({
        type: "General",
        createHandlers: createGeneralHandlers
    });
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