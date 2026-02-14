export function registerActorSheetControlsAdapter({
    game,
    ActorClass,
    transformationQueryService,
    debouncedTracker,
    ui,
    logger,
})
{
    Hooks.on("getHeaderControlsApplicationV2", (app, controls) =>
    {
        debouncedTracker.pulse("getHeaderControlsApplicationV2")
        if (!ui.policies.canShowTransformationControls({ app, game, ActorClass })) {
            return
        }

        controls.push(
            {
                action: "transformation-GM-config",
                name: "Change Transformation",
                label: "Change Transformation",
                icon: "fas fa-dna",
                onClick: async () =>
                {
                    logger.debug("Transformations menu clicked")

                    try {
                        const transformations = await transformationQueryService.getAll()
                        await ui.dialogs.openTransformationConfig({
                            actor: app.actor,
                            transformations
                        })
                    } catch (err) {
                        logger.error(
                            "Failed to open TransformationConfig",
                            err
                        )
                    }
                }
            },
            // {
            //     name: "Reset Transformation",
            //     label: "Reset Transformation",
            //     icon: "fas fa-undo",
            //     onClick: async () => {
            //         logger.debug("Reset Transformation clicked");
            //     }
            // }
        )
    })
}
