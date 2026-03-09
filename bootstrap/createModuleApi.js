import { UiAccessor } from "./uiAccessor.js"

export function createModuleApi({
    game,
    macros,
    Registry
})
{
    game.transformations = {
        getDialogFactory: () => UiAccessor.dialogs,
        logger: Registry.logger,
        executeMacro: macros.executeMacro,
        getTransformations()
        {
            logger.debug("game.transformations.getTransformations called")
            return Registry.services
                .transformationRegistry
                .getAllEntries()
        },
        getEffectInstance(actor, effectKey)
        {
            return Registry.services.rollTableEffectResolver.resolve({
                actor,
                effectKey
            })
        }
    }
}