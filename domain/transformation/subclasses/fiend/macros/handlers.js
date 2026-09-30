import { DaemonicBrand } from "../daemonicBrand/DaemonicBrand.js"

export function createFiendMacroHandlers({
    tracker,
    logger
})
{
    logger.debug("createFiendMacroHandlers", {
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        /**
         * Daemonic Brand (Attack Vulnerability): runs on the GM when a
         * branded creature is attacked, so later attacks this turn no longer
         * get Advantage.
         */
        async daemonicBrandAttacked({ actor, trigger })
        {
            logger.debug("createFiendMacroHandlers.daemonicBrandAttacked", { actor, trigger })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "on" || !actor) return
                    if (!DaemonicBrand.hasAttackVulnerability(actor)) return

                    await DaemonicBrand.markAttacked(actor)
                })()
            )
        }
    })
}
