export const EVIL_EYE_EFFECT_NAME = "Evil Eye"

export function createHagMacroHandlers({
    activeEffectRepository,
    tracker,
    logger
})
{
    logger.debug("createHagMacroHandlers", {
        activeEffectRepository,
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        /**
         * Evil Eye: a creature that fails the saving throw drops to 0 Hit Points.
         * Runs on the target when the fail-only Evil Eye effect is applied, then removes that effect.
         */
        async evilEyeDropToZero({ actor, trigger })
        {
            logger.debug("createHagMacroHandlers.evilEyeDropToZero", { actor, trigger })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "on" || !actor) return

                    if (Number(actor.system?.attributes?.hp?.value ?? 0) > 0) {
                        await actor.update({ "system.attributes.hp.value": 0 })
                    }

                    const effects = activeEffectRepository.findAllByName(actor, [EVIL_EYE_EFFECT_NAME]) || []
                    await activeEffectRepository.removeByIds(
                        actor,
                        effects.map(e => e.id)
                    )
                })()
            )
        }
    })
}
