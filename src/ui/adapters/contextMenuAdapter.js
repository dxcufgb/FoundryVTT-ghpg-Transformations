export function registerContextMenuAdapter({
    app,
    html,
    services,
    dialogs,
    logger
}) {
    html.on("contextmenu", "[data-context-action]", event => {
        const action =
            event.currentTarget.dataset.contextAction;

        logger.debug("Context menu action:", action);

        switch (action) {
            case "configure-transformation":
                dialogs.openTransformationConfig({
                    actor: app.actor,
                    parent: app
                });
                break;

            case "advance-transformation":
                services.transformationMutation.advanceStage({
                    actorId: app.actor.id
                });
                break;

            default:
                logger.warn(
                    "Unknown context menu action:",
                    action
                );
        }
    });
}
