import { createTransformationsSpellSlotRecoveryController } from "./transformationsSpellSlotRecoveryController.js"

export function createHagSpellRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createHagSpellRecoveryController")

    return createTransformationsSpellSlotRecoveryController({
        resolve,
        logger
    })
}
