export function registerActorHooks({
    transformationTypes,
    transformationService,
    transformationQueryService,
    game,
    moduleUi,
    renderTemplate,
    debouncedTracker,
    dialogFactory,
    logger
})
{
    logger.debug("registerActorHooks", {
        transformationTypes,
        transformationService,
        transformationQueryService,
        game,
        moduleUi,
        debouncedTracker,
        dialogFactory
    })

    Hooks.on("renderActorSheetV2", async (app, html, config) =>
    {
        logger.debug("renderActorSheetV2", app, html, config)
        debouncedTracker.pulse("renderActorSheetV2")
        const actor = app.actor
        const transformation = await transformationQueryService.getForActor(actor)
        const transformations = await transformationQueryService.getAll()
        const transformationStage = actor.getFlag("transformations", "stage")

        const viewModel = moduleUi.viewModels.createTransformationPillViewModel({
            actor,
            transformation,
            editable: (config.editable && transformationStage <= 3)
        })

        const pillHtml = await moduleUi.renderers.pillRenderer.render(viewModel)

        if (!pillHtml) return
        const fragment = document.createRange().createContextualFragment(pillHtml)
        const container = getPillsContainer(app, logger)
        if (!container) return
        if (container) container.append(fragment)

        const pillElement = container.querySelector('.pills-lg > .transformation')

        await moduleUi.controllers.pillController.bind({
            app,
            pillElement,
            viewModel,
            transformation,
            transformations
        })

        await injectTransformationLegendInTraitsTab(
            renderTemplate,
            game,
            moduleUi,
            app,
            html,
            transformationTypes,
            config.editable,
            logger
        )
    })

    Hooks.on("updateActor", (actor, diff, options, userId) =>
    {
        logger.debug("updateActor", actor, diff, options, userId)
        debouncedTracker.pulse("updateActor")
        if (!diff?.flags?.transformations) return
        if (userId && userId !== game.user?.id) return

        transformationService.onActorFlagsUpdated({
            actor,
            diff,
            userId
        })

    })
}

function getPillsContainer(app, logger)
{
    logger.debug("getPillsContainer", {app})
    return (
        app.element
        .querySelector('[data-tab="details"] .pills-lg > .background')
            ?.parentElement
    ) ?? (
        app.element
        .querySelector('[data-tab="details"] .pills-lg > [data-item-type="background"]')
            ?.parentElement
    )

}

async function injectTransformationLegendInTraitsTab(renderTemplate, game, moduleUi, app, html, transformationTypes, editMode, logger)
{
    logger.debug("injectTransformationLegendInTraitsTab", {
        renderTemplate,
        game,
        moduleUi,
        app,
        html,
        transformationTypes,
        editMode
    })
    const actor = app.actor
    if (!actor || actor.type !== "character") return

    const data = actor.flags.transformations
    if (!data) return

    const tab = html.querySelector('.tab-body > .tab[data-tab="specialTraits"]')
    if (!tab.children.length) return

    if (tab.querySelector('fieldset.card.transformation')) return

    const isGM = game.user.isGM

    const viewModel = moduleUi.viewModels.createTransformationCardViewModel(
        actor,
        transformationTypes,
        isGM,
        editMode
    )
    const cardHtml = await renderTemplate(
        "modules/transformations/scripts/templates/components/transformation-card.hbs",
        viewModel
    )

    const card = $(cardHtml)

    const afterFirst = tab.children[1] || null
    tab.insertBefore(card[0], afterFirst)
    moduleUi.controllers.cardController.activateTransformationCardListeners(card, actor)
}
