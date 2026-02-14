export function createBindPillEvents({
    dialogFactory,
    logger
}) {
    return function bindPillEvents({
        app,
        pill,
        pillMode,
        transformation
    }) {
        if (!pill || !app) {
            logger.error("bindPillEvents called without pill or app", {
                pill,
                app
            });
            return;
        }

        switch (pillMode) {
            case "add":
                bindAddMode({
                    app,
                    pill,
                    transformation
                });
                break;

            case "stage":
                bindStageMode({
                    app,
                    pill,
                    transformation
                });
                break;

            default:
                logger.error(
                    "bindPillEvents called with invalid mode",
                    pillMode
                );
                return;
        }
    };

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Mode-specific bindings
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function bindAddMode({ app, pill, transformation }) {
        pill.addEventListener("click", event => {
            stop(event);

            logger.debug(
                "Transformation pill (add) clicked",
                pill,
                app.actor
            );

            dialogFactory.openTransformationConfig({
                actor: app.actor,
                transformation
            });
        });
    }

    function bindStageMode({ app, pill, transformation }) {
        const stageButton =
            pill.querySelector('[data-action="pill-config-stage"]');

        if (!stageButton) {
            logger.warn(
                "Stage button not found on transformation pill",
                pill
            );
            return;
        }

        stageButton.addEventListener("click", event => {
            stop(event);

            logger.debug(
                "Transformation pill (stage) clicked",
                pill,
                app.actor
            );

            dialogFactory.openTransformationConfig({
                actor: app.actor,
                transformation
            });
        });
    }

    function stop(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}
