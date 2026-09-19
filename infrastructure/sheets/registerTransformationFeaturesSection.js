export const TRANSFORMATION_FEATURES_SECTION_ID = "transformation"

// Class features use 0, 100, ... and species/background/other use 1000+, so this
// lands directly after the class sections.
const SECTION_ORDER = 900

const WRAPPED_MARKER = Symbol.for("transformations.featuresSectionWrapped")

function isAddedByTransformation(item)
{
    return item?.flags?.transformations?.addedByTransformation === true
}

export function resolveTransformationFeaturesLabel({
    type,
    transformationTypes,
    localizer
})
{
    const displayName = transformationTypes?.[type] ?? "Transformation"
    return localizer.format("DND5E.FeaturesClass", { class: displayName })
}

/**
 * Moves every transformation-granted feature out of the regular feature sections
 * and into a dedicated "{Transformation} Features" section.
 *
 * Mutates the context produced by dnd5e's CharacterActorSheet#_prepareFeaturesContext.
 *
 * @returns {boolean} true when a section was added.
 */
export function addTransformationFeaturesSection({
    context,
    actor,
    transformationTypes,
    Inventory,
    localizer,
    logger = null
})
{
    const type = actor?.flags?.transformations?.type
    if (!type) return false
    if (!Array.isArray(context?.sections)) return false
    if (context.sections.some(section => section.id === TRANSFORMATION_FEATURES_SECTION_ID)) return false
    if (typeof Inventory?.prepareSections !== "function") return false

    const items = context.sections
        .flatMap(section => section.items ?? [])
        .filter(isAddedByTransformation)
    if (!items.length) return false

    const itemSet = new Set(items)
    const columnTemplate =
              context.sections.find(section => section.id === "other")
              ?? context.sections[0]

    const [section] = Inventory.prepareSections([{
        id: TRANSFORMATION_FEATURES_SECTION_ID,
        label: resolveTransformationFeaturesLabel({ type, transformationTypes, localizer }),
        order: SECTION_ORDER,
        groups: { origin: TRANSFORMATION_FEATURES_SECTION_ID },
        columns: foundry.utils.deepClone(columnTemplate?.columns ?? []),
        items
    }])

    for (const existing of context.sections) {
        existing.items = (existing.items ?? []).filter(item => !itemSet.has(item))
    }

    for (const item of items) {
        const itemContext = context.itemContext?.[item.id]
        if (!itemContext) continue
        itemContext.groups = {
            ...itemContext.groups,
            origin: TRANSFORMATION_FEATURES_SECTION_ID
        }
        itemContext.dataset = {
            ...itemContext.dataset,
            "group-origin": TRANSFORMATION_FEATURES_SECTION_ID
        }
    }

    context.sections.push(section)
    context.sections.sort((left, right) => left.order - right.order)

    logger?.debug?.("addTransformationFeaturesSection", {
        type,
        items: items.map(item => item.name)
    })
    return true
}

function resolveCharacterSheetClass()
{
    return (
        CONFIG.Actor?.sheetClasses?.character?.["dnd5e.CharacterActorSheet"]?.cls
        ?? globalThis.dnd5e?.applications?.actor?.CharacterActorSheet
        ?? null
    )
}

/**
 * dnd5e builds the features tab sections inside CharacterActorSheet#_prepareFeaturesContext,
 * which runs after the `dnd5e.prepareSheetContext` hook, so the hook cannot add a section.
 * Wrapping the method lets the new section go through dnd5e's own template.
 */
export function registerTransformationFeaturesSection({
    transformationTypes,
    logger
})
{
    logger.debug("registerTransformationFeaturesSection", { transformationTypes })

    const SheetClass = resolveCharacterSheetClass()
    const original = SheetClass?.prototype?._prepareFeaturesContext

    if (typeof original !== "function") {
        logger.warn(
            "Transformation features section not registered: CharacterActorSheet#_prepareFeaturesContext not found"
        )
        return
    }

    if (original[WRAPPED_MARKER]) return

    const wrapped = async function (context, options)
    {
        const result = await original.call(this, context, options)

        try {
            addTransformationFeaturesSection({
                context: result ?? context,
                actor: this.actor,
                transformationTypes,
                Inventory: customElements.get(this.options.elements.inventory),
                localizer: game.i18n,
                logger
            })
        } catch (error) {
            logger.error("Failed to add transformation features section", error)
        }

        return result
    }
    wrapped[WRAPPED_MARKER] = true

    SheetClass.prototype._prepareFeaturesContext = wrapped
}
