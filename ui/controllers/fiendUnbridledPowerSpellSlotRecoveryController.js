import { createTransformationsSpellSlotRecoveryController } from "./transformationsSpellSlotRecoveryController.js"

export function createFiendUnbridledPowerSpellSlotRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createFiendUnbridledPowerSpellSlotRecoveryController")

    return createTransformationsSpellSlotRecoveryController({
        resolve,
        logger
    })
}
