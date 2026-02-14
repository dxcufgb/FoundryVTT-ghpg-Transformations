export function createTransformationPillRenderer({
    tracker,
    renderTemplate,
    templates,
    logger
})
{
    logger.debug("createTransformationPillRenderer", {
        tracker,
        renderTemplate,
        templates
    })

    async function render(viewModel)
    {
        logger.debug("createTransformationPillRenderer.render", { viewModel })
        return tracker.track(
            (async () =>
            {
                if (!viewModel) return null

                return renderTemplate(
                    templates.actorTransformationPill,
                    viewModel
                )
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        render
    })

}
