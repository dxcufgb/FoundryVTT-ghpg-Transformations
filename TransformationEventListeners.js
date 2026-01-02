export function registerTransformationStageChangeListener(app, html, data) {
    const select = html.querySelector('.transformation-stage-select');
    if (!select) return;

    select.addEventListener("click", event => {
        event.preventDefault();

        const pillConfig = TransformationModule.dialogConfigs.PillConfig
        new pillConfig.TransformationStageConfig({
            actor: app.actor
        }).render(true);
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