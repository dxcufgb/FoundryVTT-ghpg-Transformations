export function interpolate(template, { actor, transformation, variables }, logger = null) {
    logger?.debug?.("interpolate", {
        template,
        actor,
        transformation,
        variables
    })
    return template.replace(/@([\w.]+)/g, (_, path) => {
        const value =
            resolvePath(variables, path, logger) ??
            resolvePath({ actor, transformation }, path, logger);

        return value != null ? value : "";
    });
}

function resolvePath(obj, path, logger = null) {
    logger?.debug?.("resolvePath", { obj, path })
    return path.split(".").reduce(
        (acc, key) => acc?.[key],
        obj
    );
}
