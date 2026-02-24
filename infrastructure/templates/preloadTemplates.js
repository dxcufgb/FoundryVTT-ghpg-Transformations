export async function preloadTemplates(logger = null) {
    logger?.debug?.("preloadTemplates", {})
    const templates = [
        "modules/transformations/scripts/templates/components/context-menu.hbs",
        "modules/transformations/scripts/templates/components/transformation-pill.hbs",
        "modules/transformations/scripts/templates/dialogs/transformation-choice.hbs",
        "modules/transformations/scripts/templates/dialogs/transformation-config.hbs"
    ];

    await foundry.applications.handlebars.loadTemplates(templates);
}
