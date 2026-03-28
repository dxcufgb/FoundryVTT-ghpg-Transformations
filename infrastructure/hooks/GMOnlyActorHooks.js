import { disadvantageOnAllD20RollsEffectChanges } from "../../config/disadvantageOnAllD20Rolls.js"

export function registerGMOnlyActorHooks({
    game,
    ActorClass,
    moduleUi,
    actorRepository,
    triggerRuntime,
    transformationQueryService,
    constants,
    registerActorSheetControlsAdapter,
    debouncedTracker,
    logger
})
{
    logger.debug("registerGMOnlyActorHooks", {
        game,
        ActorClass,
        moduleUi,
        actorRepository,
        triggerRuntime,
        transformationQueryService,
        constants,
        registerActorSheetControlsAdapter,
        debouncedTracker
    })

    registerActorSheetControlsAdapter({
        game,
        ActorClass,
        debouncedTracker,
        transformationQueryService,
        moduleUi,
        logger
    })

    Hooks.on("createActiveEffect", async (effect, options, userId) =>
    {
        logger.debug("GM createActiveEffect", effect, options, userId)
        debouncedTracker.pulse("createActiveEffect")
        const executionContext = effect.parent?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        const actor = effect.parent
        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        const effectName = effect.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.BLOODIED:
                try {
                    await triggerRuntime.run("bloodied", actor)
                } catch (err) {
                    logger.error(
                        "Error handling bloodied trigger",
                        { actor, err }
                    )
                }
                break

            default:
                break
        }
    })

    Hooks.on("applyActiveEffect", async (target, context) =>
    {
        logger.debug("GM applyActiveEffect", target, context)
        debouncedTracker.pulse("applyActiveEffect")
        const actor = actorRepository.resolveActor(target)
        const executionContext = actor?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        const effectName = context.effect?.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.UNCONSCIOUS:
                try {
                    await triggerRuntime.run("unconscious", actor)
                } catch (err) {
                    logger.error(
                        "Error handling unconscious trigger",
                        { actor, err }
                    )
                }
                break
            default:
                logger.debug("Unhandled effect", effectName)
                break
        }
    })

    Hooks.on("deleteActiveEffect", async (effect, options, userId) =>
    {
        logger.debug("GM deleteActiveEffect", effect, options, userId)
        debouncedTracker.pulse("deleteActiveEffect")

        const actor = actorRepository.resolveActor(effect?.parent)
        if (!actor) return

        const fiendFlags = actor.flags?.transformations?.fiend ?? {}
        const giftEntry =
            Object.entries(fiendFlags).find(([, entry]) =>
                entry?.effectId === effect.id
            ) ??
            Object.entries(fiendFlags).find(([giftId]) =>
                giftId === effect.getFlag("transformations", "giftOfDamnationId")
            )

        if (!giftEntry) return

        const [giftId, entry] = giftEntry
        const itemIds = Array.isArray(entry?.itemIds)
            ? entry.itemIds.filter(itemId => actor.items.get(itemId))
            : []

        if (itemIds.length) {
            await actor.deleteEmbeddedDocuments("Item", itemIds)
        }

        await actor.update({
            [`flags.transformations.fiend.-=${giftId}`]: null
        })
    })

    Hooks.on("preUpdateActiveEffect", (effect, data) =>
    {
        logger.debug("preUpdateActiveEffect", effect, data)
        if (data.disabled !== false) return
        if (!effect.getFlag("transformations", "addDisadvantageAllD20")) return

        if (effect.changes?.some(c =>
            c.key === "system.abilities.cha.check.roll.mode"
        )) return

        data.changes = disadvantageOnAllD20RollsEffectChanges

        foundry.utils.setProperty(
            data,
            "flags.transformations.addDisadvantageAllD20",
            false
        )

    })
}
