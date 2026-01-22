export function registerActorHooks({
    transformationService,
    transformationQueryService,
    ui,
    dialogFactory,
    logger,
}) {

    Hooks.on("renderActorSheetV2", (app, html, config) => {
        logger.debug("renderActorSheetV2", app, html, config);
        const actor = app.actor;
        (async () => {
            const transformation = await transformationQueryService.getForActor(actor);
            const transformations = await transformationQueryService.getAll();

            const viewModel = ui.viewModels.createTransformationPillViewModel({
                actor,
                transformation,
                editable: config.editable
            });

            const pillHtml = await ui.renderers.pillRenderer.render(viewModel);

            if (!pillHtml) return;
            const fragment = document.createRange().createContextualFragment(pillHtml);
            const container = app.element.querySelector('[data-tab="details"] .pills-lg > .background')?.parentElement;
            if (container) container.append(fragment);

            const pillElement = container.querySelector('.pills-lg > .transformation');

            ui.controllers.pillController.bind({
                app,
                pillElement,
                viewModel,
                transformation,
                transformations
            });
        })();
    });

    Hooks.on("updateActor", async (actor, diff, options, userId) => {
        logger.debug("updateActor", actor, diff, options, userId);
        if (!diff?.flags?.dnd5e) return;

        transformationService.onActorFlagsUpdated({
            actor,
            diff,
            userId
        });
    });

    Hooks.on("threeDotMenu", ({ app, button }) => {
        logger.debug("threeDotMenu", app, button);
        dialogFactory.openContextMenu(app, button);
    });
}
