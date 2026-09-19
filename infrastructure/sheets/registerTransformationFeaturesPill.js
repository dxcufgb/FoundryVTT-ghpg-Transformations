const TEMPLATE =
          "modules/transformations/scripts/templates/components/transformation-features-pill.hbs"
const PILL_SELECTOR = ".transformation-features-pills"

const BACKGROUND_FOLDER = "modules/transformations/Icons/Transformations"

/**
 * "Shadowsteel Ghoul" -> ".../Shadowsteel_Ghoul_pill_background.png".
 * The route must be absolute: the underlay url() is resolved against dnd5e's stylesheet, not the page.
 */
export function getPillBackgroundPath(transformationName)
{
    const fileName = String(transformationName).trim().replace(/\s+/g, "_")
    return foundry.utils.getRoute(`${BACKGROUND_FOLDER}/${fileName}_pill_background.png`)
}

export function createTransformationFeaturesPillViewModel(transformation)
{
    const stage = transformation.stage ?? 0
    const displayName = transformation.constructor.displayName ?? transformation.definition.name
    return {
        name: transformation.definition.name,
        img: transformation.definition.img,
        background: getPillBackgroundPath(displayName),
        uuid: transformation.definition.uuid,
        stage,
        subtitle: stage === 0 ? "Dormant" : "Transformation"
    }
}

/**
 * Shows a read-only pill for the active transformation, directly below the class pills
 * on the character sheet's features tab. It reuses dnd5e's class pill markup and styling.
 */
export function registerTransformationFeaturesPill({
    transformationQueryService,
    renderTemplate,
    logger
})
{
    logger.debug("registerTransformationFeaturesPill", {
        transformationQueryService,
        renderTemplate
    })

    Hooks.on("renderActorSheetV2", async app =>
    {
        const actor = app.actor
        if (actor?.type !== "character") return

        const featuresTab = app.element?.querySelector('.tab-body > .tab[data-tab="features"]')
        const classPills = featuresTab?.querySelector("section.classes.pills-lg")
        if (!classPills) return

        try {
            const transformation = await transformationQueryService.getForActor(actor)
            const pillHtml = transformation
                ? await renderTemplate(TEMPLATE, createTransformationFeaturesPillViewModel(transformation))
                : null

            // Remove after the awaits so concurrent renders can never leave two pills behind.
            featuresTab.querySelectorAll(PILL_SELECTOR).forEach(element => element.remove())
            if (!pillHtml || !classPills.isConnected) return

            classPills.insertAdjacentHTML("afterend", pillHtml)
        } catch (error) {
            logger.error("Failed to render transformation features pill", error)
        }
    })
}
