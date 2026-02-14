/**
 * Resolve a numeric expression with @variables and @namespaces.
 */
export function resolveExpression(expression, context = {}, logger = null) {
    logger?.debug?.("resolveExpression", { expression, context })
    if (typeof expression === "number") return expression;
    if (typeof expression !== "string") return 0;

    const replaced = expression.replace(
        /@([a-zA-Z_][a-zA-Z0-9_.]*)/g,
        (_, path) => {
            const value = getPathValue(context, path, logger);
            return Number.isFinite(value) ? value : 0;
        }
    );

    // Safety check
    if (!/^[0-9+\-*/().\s]+$/.test(replaced)) {
        console.warn("Unsafe expression rejected:", expression);
        return 0;
    }

    try {
        const result = Function(`"use strict"; return (${replaced});`)();
        return Number.isFinite(result) ? Math.floor(result) : 0;
    } catch (err) {
        console.warn("Expression evaluation failed:", expression, err);
        return 0;
    }
}

/**
 * Safely resolve a dotted path from an object.
 */
function getPathValue(obj, path, logger = null) {
    logger?.debug?.("getPathValue", { obj, path })
    return path.split(".").reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
            return acc[key];
        }
        return undefined;
    }, obj);
}
