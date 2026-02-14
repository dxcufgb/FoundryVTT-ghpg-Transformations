export function createMockTransformationService()
{
    return {
        __isMock: true,

        applyTransformation: async (actor, { definition }) =>
        {
            console.warn("🧪 MOCK applyTransformation", actor.name)
            debouncedTracker.pulse("applyTransformationType")
            await actor.setFlag(
                "transformations",
                "type",
                definition.id
            )
        },

        clearTransformation: async actor =>
        {
            await actor.unsetFlag("transformations", "type")
        }
    }
}
