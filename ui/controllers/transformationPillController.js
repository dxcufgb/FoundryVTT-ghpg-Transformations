export function createTransformationPillController({
    dialogs,
    logger
}) {
    function bind({
        app,
        pillElement,
        viewModel,
        transformation,
        transformations
    }) {
        if (!pillElement) return;

        if (viewModel.mode === "add") {
            pillElement.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                dialogs.openTransformationConfig({
                    actor: app.actor,
                    transformations
                });
            });
        }

        if (viewModel.mode === "stage" && viewModel.editable) {
            const stageButton =
                pillElement.querySelector(
                    '[data-action="pill-config-stage"]'
                );

            stageButton?.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();

                dialogs.openTransformationConfig({
                    actor: app.actor,
                    transformations
                });
            });
        }
    }

    return Object.freeze({ bind });
}
