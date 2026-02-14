export function registerActorHooks({
    transformationTypes,
    transformationService,
    transformationQueryService,
    game,
    ui,
    debouncedTracker,
    dialogFactory,
    logger,
})
{
    Hooks.on("renderActorSheetV2", async (app, html, config) =>
    {
        debouncedTracker.pulse("renderActorSheetV2")
        logger.debug("renderActorSheetV2", app, html, config)
        const actor = app.actor
        const transformation = await transformationQueryService.getForActor(actor)
        const transformations = await transformationQueryService.getAll()
        const transformationStage = actor.getFlag("transformations", "stage")

        const viewModel = ui.viewModels.createTransformationPillViewModel({
            actor,
            transformation,
            editable: (config.editable && transformationStage <= 3)
        })

        const pillHtml = await ui.renderers.pillRenderer.render(viewModel)

        if (!pillHtml) return
        const fragment = document.createRange().createContextualFragment(pillHtml)
        const container = getPillsContainer(app)
        if (container) container.append(fragment)

        const pillElement = container.querySelector('.pills-lg > .transformation')

        await ui.controllers.pillController.bind({
            app,
            pillElement,
            viewModel,
            transformation,
            transformations
        })

        injectTransformationLegendInTraitsTab(game, ui, app, html, transformationTypes, config.editable)
    })

    Hooks.on("updateActor", (actor, diff, options, userId) =>
    {
        debouncedTracker.pulse("updateActor")
        logger.debug("updateActor", actor, diff, options, userId)
        if (!diff?.flags?.transformations) return

        transformationService.onActorFlagsUpdated({
            actor,
            diff,
            userId
        })

    })
}

function getPillsContainer(app)
{
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

async function injectTransformationLegendInTraitsTab(game, ui, app, html, transformationTypes, editMode)
{
    const actor = app.actor
    if (!actor || actor.type !== "character") return

    const data = actor.flags.transformations
    if (!data) return

    const tab = html.querySelector('.tab-body > .tab[data-tab="specialTraits"]')
    if (!tab.children.length) return

    if (tab.querySelector('fieldset.card.transformation')) return

    const isGM = game.user.isGM

    const viewModel = ui.viewModels.createTransformationCardViewModel(
        actor,
        transformationTypes,
        isGM,
        editMode)
    const cardHtml = await renderTemplate(
        "modules/transformations/scripts/templates/components/transformation-card.hbs",
        viewModel
    )

    const card = $(cardHtml)

    const afterFirst = tab.children[1] || null
    tab.insertBefore(card[0], afterFirst)
    ui.controllers.cardController.activateTransformationCardListeners(card, actor)
}
