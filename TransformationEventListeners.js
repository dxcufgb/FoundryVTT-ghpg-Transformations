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