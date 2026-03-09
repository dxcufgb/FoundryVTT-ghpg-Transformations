import { disadvantageOnAllD20RollsEffectChanges } from "../config/disadvantageOnAllD20Rolls.js"

export function createGeneralHandlers({
    activeEffectRepository,
    itemRepository,
    logger
})
{
    logger.debug("createGeneralHandlers", {
        activeEffectRepository,
        itemRepository
    })

    return Object.freeze({

        async removeOnLongRest({ actor, trigger })
        {
            logger.debug("createGeneralHandlers.removeOnLongRest", { actor, trigger })
            if (trigger !== "longRest") return
            await itemRepository.removeItemsOnLongRest(actor)
            await activeEffectRepository.removeEffectsOnLongRest(actor)
        },

        getDisadvantageOnAllD20Rolls({ effect })
        {
            effect.changes = disadvantageOnAllD20RollsEffectChanges
        }
    })
}
