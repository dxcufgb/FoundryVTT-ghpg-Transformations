export function createGetPillHtml({
    tracker,
    renderTemplate,
    templates,
    logger
})
{
    if (typeof renderTemplate !== "function") {
        throw new Error("renderTemplate was not injected")
    }

    return async function getPillHtml(data)
    {
        return tracker.track(
            (async () =>
            {
                if (!templates?.actorTransformationPill) {
                    throw new Error("actorTransformationPill template not cached")
                }

                logger?.debug?.("Rendering transformation pill", data)

                return await renderTemplate(
                    templates.actorTransformationPill,
                    data
                )
            })()
        )
    }
}