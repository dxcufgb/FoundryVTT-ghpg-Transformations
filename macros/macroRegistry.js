export function createMacroRegistry({ logger }) {
    logger.debug("createMacroRegistry", {})
    const registry = new Map();

    function register({ type, createHandlers }) {
        logger.debug("createMacroRegistry.register", { type, createHandlers })
        if (!type) {
            throw new Error("Macro registry entry requires type");
        }

        if (typeof createHandlers !== "function") {
            throw new Error(
                `Macro registry entry '${type}' is missing createHandlers`
            );
        }

        if (registry.has(type)) {
            logger.warn("Macro registry entry already exists", type);
            return;
        }

        registry.set(type, Object.freeze({
            type,
            createHandlers
        }));

        logger.debug(
            "Macro registry registered",
            type
        );
    }

    function get(type) {
        logger.debug("createMacroRegistry.get", { type })
        return registry.get(type) ?? null;
    }

    return Object.freeze({
        register,
        get
    });
}
