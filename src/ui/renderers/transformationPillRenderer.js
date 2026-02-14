export function createTransformationPillRenderer({
    tracker,
    renderTemplate,
    templates,
    logger
})
{
    async function render(viewModel)
    {
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