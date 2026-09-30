export function createTransformationCardController({
    transformationService,
    debouncedTracker,
    logger
})
{
    logger.debug("createTransformationCardController", { transformationService, debouncedTracker })

    function activateTransformationCardListeners(html, actor)
    {
        logger.debug("createTransformationCardController.activateTransformationCardListeners", { html, actor })
        // Route edits through the transformation service so a type change clears the old
        // transformation and a stage change applies or removes every stage in between.
        html.find('[data-action="change-type"]').on("change", async event =>
        {
            const select = event.currentTarget
            const value = select.value
            debouncedTracker.pulse("applyTransformationType")
            select.disabled = true
            try {
                await transformationService.changeTransformationType(actor, value)
            } finally {
                select.disabled = false
            }
        })

        html.find('[data-action="change-stage"]').on("change", async event =>
        {
            const select = event.currentTarget
            const value = Number(select.value)
            debouncedTracker.pulse("applyTransformationStage")
            select.disabled = true
            try {
                const result = await transformationService.changeTransformationStage(actor, value)
                if (result?.ok === false) {
                    select.value = String(actor.flags?.transformations?.stage ?? 0)
                }
            } finally {
                select.disabled = false
            }
        })
    }
    return {
        activateTransformationCardListeners
    }
}
