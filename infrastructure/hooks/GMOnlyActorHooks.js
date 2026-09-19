import { disadvantageOnAllD20RollsEffectChanges } from "../../config/disadvantageOnAllD20Rolls.js"

export function registerGMOnlyActorHooks({
    game,
    ActorClass,
    moduleUi,
    actorRepository,
    triggerRuntime,
    transformationQueryService,
    constants,
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
        debouncedTracker
    })

    const previousHpByActorId = new Map()

    // Every connected GM receives these document hooks. Without this guard each of them would
    // run the same trigger, duplicating chat messages, temp HP, saves and item changes.
    // preUpdate* hooks only run on the client making the change, and updateActor relies on
    // the HP captured by that same client, so neither of those is guarded.
    function isActiveGM()
    {
        return Boolean(game?.user?.id) && game.user.id === game.users?.activeGM?.id
    }

    Hooks.on("createActiveEffect", async (effect, options, userId) =>
    {
        logger.debug("GM createActiveEffect", effect, options, userId)
        if (!isActiveGM()) return
        debouncedTracker.pulse("createActiveEffect")
        const executionContext = effect.parent?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        const actor = effect.parent
        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        await dispatchTransformationEffectHook("createActiveEffect", {
            TransformationClass: transformation.constructor,
            effect,
            actor,
            options,
            userId
        })

        const effectName = effect.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.BLOODIED:
                try {
                    await triggerRuntime.run("bloodied", actor)
                } catch (err) {
                    logger.error(
                        "Error handling bloodied trigger",
                        {actor, err}
                    )
                }
                break
            case constants.CONDITION.UNCONSCIOUS:
                try {
                    await triggerRuntime.run("unconscious", actor)
                } catch (err) {
                    logger.error(
                        "Error handling unconscious trigger",
                        {actor, err}
                    )
                }
                break
            case constants.CONDITION.CHARMED:
            case constants.CONDITION.FRIGHTENED:
                try {
                    await triggerRuntime.run("conditionApplied", actor, {
                        conditions: {
                            current: {
                                name: effectName
                            }
                        }
                    })
                } catch (err) {
                    logger.error(
                        "Error handling conditionApplied trigger",
                        {actor, effectName, err}
                    )
                }
                break
            default:
                break
        }
    })

    Hooks.on("preUpdateActor", (actor, changed, options, userId) =>
    {
        logger.debug("GM preUpdateActor", actor, changed, options, userId)

        const nextHpValue = getUpdatedHpValue(changed)

        if (nextHpValue == null) {
            return
        }

        const previousHp = Number(actor?.system?.attributes?.hp?.value ?? NaN)

        if (!Number.isFinite(previousHp) || !actor?.id) {
            return
        }

        previousHpByActorId.set(actor.id, previousHp)
    })

    Hooks.on("updateActor", async (actor, changed, options, userId) =>
    {
        logger.debug("GM updateActor", actor, changed, options, userId)
        debouncedTracker.pulse("GM.updateActor")

        const previousHp = actor?.id
            ? previousHpByActorId.get(actor.id)
            : undefined

        if (actor?.id) {
            previousHpByActorId.delete(actor.id)
        }

        if (previousHp == null || !didTransitionToZeroHp(actor, previousHp)) {
            return
        }

        const executionContext = actor?.getFlag?.(
            "transformations",
            "executionContext"
        )

        if (executionContext === "macro") return

        const resolvedActor = actorRepository.resolveActor(actor)
        if (!resolvedActor) return

        const transformation = await transformationQueryService.getForActor(
            resolvedActor
        )
        if (!transformation) return

        try {
            await triggerRuntime.run("zeroHp", resolvedActor)
        } catch (err) {
            logger.error(
                "Error handling zeroHp trigger",
                {actor: resolvedActor, err}
            )
        }
    })

    Hooks.on("applyActiveEffect", async (target, context) =>
    {
        logger.debug("GM applyActiveEffect", target, context)
        if (!isActiveGM()) return
        debouncedTracker.pulse("applyActiveEffect")
        const actor = actorRepository.resolveActor(target)
        const executionContext = actor?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        const effectName = context.effect?.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.BLOODIED:
                try {
                    await triggerRuntime.run("bloodied", actor)
                } catch (err) {
                    logger.error(
                        "Error handling bloodied trigger",
                        {actor, err}
                    )
                }
                break
            case constants.CONDITION.UNCONSCIOUS:
                try {
                    await triggerRuntime.run("unconscious", actor)
                } catch (err) {
                    logger.error(
                        "Error handling unconscious trigger",
                        {actor, err}
                    )
                }
                break
            case constants.CONDITION.CHARMED:
            case constants.CONDITION.FRIGHTENED:
                try {
                    await triggerRuntime.run("conditionApplied", actor, {
                        conditions: {
                            current: {
                                name: effectName
                            }
                        }
                    })
                } catch (err) {
                    logger.error(
                        "Error handling conditionApplied trigger",
                        {actor, effectName, err}
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
        if (!isActiveGM()) return
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

    async function dispatchTransformationEffectHook(
        hookName,
        {
            TransformationClass,
            effect,
            actor,
            options = {},
            userId = null
        }
    )
    {
        if (typeof TransformationClass?.[hookName] !== "function") return

        try {
            await TransformationClass[hookName]({
                effect,
                actor,
                options,
                userId,
                logger
            })
        } catch (err) {
            logger.error(`Error handling ${hookName} transformation hook`, {
                actor,
                effect,
                err
            })
        }
    }

    async function dispatchTransformationItemHook(hookName, item, changed, options, userId)
    {
        logger.debug(hookName, item, changed, options, userId)
        const actor = actorRepository.resolveActor(item?.parent)
        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        const TransformationClass = transformation?.constructor

        if (typeof TransformationClass?.[hookName] !== "function") return

        try {
            await TransformationClass[hookName]({
                item,
                changed,
                options,
                userId,
                actor,
                logger
            })
        } catch (err) {
            logger.error(`Error handling ${hookName} transformation hook`, {
                actor,
                item,
                changed,
                err
            })
        }
    }

    Hooks.on("preUpdateItem", async (item, changed, options, userId) =>
    {
        await dispatchTransformationItemHook(
            "preUpdateItem",
            item,
            changed,
            options,
            userId
        )
    })

    Hooks.on("updateItem", async (item, changed, options, userId) =>
    {
        if (!isActiveGM()) return

        await dispatchTransformationItemHook(
            "updateItem",
            item,
            changed,
            options,
            userId
        )
    })

    function getUpdatedHpValue(changed)
    {
        return foundry.utils.getProperty(
            changed,
            "system.attributes.hp.value"
        )
    }

    function didTransitionToZeroHp(actor, previousHp)
    {
        const currentHp = Number(actor?.system?.attributes?.hp?.value ?? NaN)

        if (!Number.isFinite(previousHp) || !Number.isFinite(currentHp)) {
            return false
        }

        return previousHp > 0 && currentHp <= 0
    }
}
