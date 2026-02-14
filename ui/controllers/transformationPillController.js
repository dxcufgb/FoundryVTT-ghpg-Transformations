export function createTransformationPillController({
    dialogs,
    logger
})
{
    logger.debug("createTransformationPillController", { dialogs })

    function bind({
        app,
        pillElement,
        viewModel,
        transformation,
        transformations
    })
    {
        logger.debug("createTransformationPillController.bind", {
            app,
            pillElement,
            viewModel,
            transformation,
            transformations
        })
        if (!pillElement) return

        if (viewModel.mode === "add") {
            pillElement.addEventListener("click", event =>
            {
                event.preventDefault()
                event.stopPropagation()

                dialogs.openTransformationConfig({
                    actor: app.actor,
                    transformations
                })
            })
        }

        if (viewModel.mode === "stage" && viewModel.editable) {
            const stageButton =
                pillElement.querySelector(
                    '[data-action="pill-config-stage"]'
                )

            stageButton?.addEventListener("click", async event =>
            {
                event.preventDefault()
                event.stopPropagation()

                const actor = app.actor
                if (!actor) return

                const currentStage = actor.flags?.transformations?.stage ?? 1

                const nextStage = currentStage + 1

                logger.debug(
                    "Advancing transformation stage",
                    actor.id,
                    currentStage,
                    "→",
                    nextStage
                )

                await actor.update({
                    "flags.transformations.stage": nextStage
                })
            })
        }
    }

    return Object.freeze({ bind })
}
