export function registerActorSheetControlsAdapter({
    game,
    ActorClass,
    transformationQueryService,
    ui,
    logger,
}) {
    Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {

        if (!ui.policies.canShowTransformationControls({ app, game, ActorClass })) {
            return;
        }

        controls.push(
            {
                name: "Change Transformation",
                label: "Change Transformation",
                icon: "fas fa-dna",
                onClick: async () => {
                    logger.debug("Transformations menu clicked");

                    try {
                        const transformations = await transformationQueryService.getAll();
                        await ui.dialogs.openTransformationConfig({
                            actor: app.actor,
                            transformations
                        });
                    } catch (err) {
                        logger.error(
                            "Failed to open TransformationConfig",
                            err
                        );
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
        );
    });
}
