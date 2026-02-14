export function createTransformationCardController({
    debouncedTracker,
    logger
})
{
    logger.debug("createTransformationCardController", { debouncedTracker })

    function activateTransformationCardListeners(html, actor)
    {
        logger.debug("createTransformationCardController.activateTransformationCardListeners", { html, actor })
        html.find('[data-action="change-type"]').on("change", async event =>
        {
            const value = event.currentTarget.value
            debouncedTracker.pulse("applyTransformationType")
            await actor.setFlag("transformations", "type", value)
        })

        html.find('[data-action="change-stage"]').on("change", async event =>
        {
            const value = Number(event.currentTarget.value)
            debouncedTracker.pulse("applyTransformationStage")
            await actor.setFlag("transformations", "stage", value)
        })
    }
    return {
        activateTransformationCardListeners
    }
}
