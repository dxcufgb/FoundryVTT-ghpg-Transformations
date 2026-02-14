export function createDnd5eConfig({
    constants,
    transformationSubTypes,
    logger = null
})
{
    logger?.debug?.("createDnd5eConfig", {
        constants,
        transformationSubTypes
    })
    const { TRANSFORMATION_FEATURE } = constants

    CONFIG.DND5E.featureTypes.transformation = {
        label: TRANSFORMATION_FEATURE,
        subtypes: transformationSubTypes
    }
}
