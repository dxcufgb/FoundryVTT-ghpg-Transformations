// services/triggers/utils/substitute.js

export function substitute(expression, scope, logger = null) {
    logger?.debug?.("substitute", { expression, scope })
    if (typeof expression !== "string") {
        return expression;
    }

    return expression.replace(
        /@([a-zA-Z0-9_.]+)/g,
        (_, path) => {
            const value = getByPath(scope, path, logger);

            if (value == null) {
                throw new Error(
                    `Unresolved variable '@${path}' in expression '${expression}'`
                );
            }

            return String(value);
        }
    );
}

function getByPath(obj, path, logger = null) {
    logger?.debug?.("getByPath", { obj, path })
    return path.split(".").reduce(
        (acc, key) => acc?.[key],
        obj
    );
}
