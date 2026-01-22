const getProperty = foundry.utils.getProperty;
const setProperty = foundry.utils.setProperty;

function buildOnceFlagPath(once, context) {
    const scope = once.scope ?? "transformation";

    let path = "flags.transformations.once";

    if (scope === "transformation") {
        path += `.${context.transformationId}`;
    }

    if (scope === "stage") {
        path += `.stage-${context.stage}`;
    }

    path += `.${once.key}`;

    return path;
}

export function hasActionRun(actor, once, context) {
    const path = buildOnceFlagPath(once, context);
    return getProperty(actor, path) === true;
}

export async function markActionAsRun(actor, once, context) {
    const path = buildOnceFlagPath(once, context);
    await actor.update({ [path]: true });
}