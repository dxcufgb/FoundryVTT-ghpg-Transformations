export function registerTransformationStageChangeListener(app, html, data) {
    const select = html.find('.transformation-stage-select');
    if (!select.length) return;

    select.on("change", event => {
        const value = event.target.value;
        TransformationModule.logger.debug("Transformation stage changed to: ", value);
        app.actor.setFlag("dnd5e", "transformation-level", value);
        const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(app.actor);
        transformation.onTransformationUpdate();
    });
}

export function registerTransformationConfigurationEventListeners(app, html, data) {
    html.addEventListener("click", event => {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const action = button.dataset.action;
        const config = button.dataset.config;
        if (action === "showConfiguration" && config === "transformation") {
            if (!app.isEditable) return;
            const showConfiguration = TransformationModule.dialogConfigs.showConfiguration;

            new showConfiguration.TransformationConfig(
                app.actor,
                TransformationModule.Transformations
            ).render(true);
        }
    });
}