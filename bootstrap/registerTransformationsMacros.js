import * as subclasses from "../domain/transformation/subclasses/index.js"
import { createGeneralHandlers } from "../macros/createGeneralHandlers.js"

export function registerTransformationMacros({
    macroRegistry,
    logger
})
{
    logger.debug("registerTransformationMacros", { macroRegistry })

    macroRegistry.register({
        type: "General",
        createHandlers: createGeneralHandlers
    })
    for (const subclass of Object.values(subclasses)) {
        const handlers = subclass.handlers

        if (isEmptyHandlersExport(handlers)) {
            continue
        }

        if (!handlers?.type || !handlers?.createMacroHandlers) {
            logger.warn(
                "Invalid transformation subclass macro export",
                handlers
            )
            continue
        }

        macroRegistry.register({
            type: handlers.type,
            createHandlers: handlers.createMacroHandlers
        })
    }
}

function isEmptyHandlersExport(handlers)
{
    return Boolean(
        handlers &&
        typeof handlers === "object" &&
        !Array.isArray(handlers) &&
        Object.keys(handlers).length === 0
    )
}
