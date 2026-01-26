export function interpolate(template, { actor, transformation, variables }) {
    return template.replace(/@([\w.]+)/g, (_, path) => {
        const value =
            resolvePath(variables, path) ??
            resolvePath({ actor, transformation }, path);

        return value != null ? value : "";
    });
}

function resolvePath(obj, path) {
    return path.split(".").reduce(
        (acc, key) => acc?.[key],
        obj
    );
}
