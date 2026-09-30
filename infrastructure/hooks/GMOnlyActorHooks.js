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

    // Every connected GM receives these document hooks. Without this guard each of them would
    // run the same trigger, duplicating chat messages, temp HP, saves and item changes.
    // preUpdate* hooks only run on the client making the change, so they are registered for every
    // client in registerActorPreUpdateHooks and hand what they capture over in the update options.
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

        await runConditionTriggers(actor, effect.name?.toLowerCase())
    })

    Hooks.on("updateActor", async (actor, changed, options, userId) =>
    {
        logger.debug("GM updateActor", actor, changed, options, userId)
        if (!isActiveGM()) return
        debouncedTracker.pulse("GM.updateActor")

        const previousHp = getPreviousHpFromOptions(actor, options)

        if (previousHp != null && didLoseHp(actor, previousHp)) {
            await repeatSavesOnDamage(actor)
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

    // Not "applyActiveEffect": that hook fires for every change of every effect on every data
    // preparation, which re-ran these triggers on each actor refresh. A condition counts as
    // applied when its effect is created (above) or re-enabled.
    Hooks.on("updateActiveEffect", async (effect, changed, options, userId) =>
    {
        logger.debug("GM updateActiveEffect", effect, changed, options, userId)
        if (!isActiveGM()) return
        if (changed?.disabled !== false) return
        debouncedTracker.pulse("updateActiveEffect")

        const actor = actorRepository.resolveActor(effect?.parent)
        if (!actor) return

        const executionContext = actor.getFlag?.("transformations", "executionContext")
        if (executionContext === "macro") return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        await runConditionTriggers(actor, effect.name?.toLowerCase())
    })

    async function runConditionTriggers(actor, effectName)
    {
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
    }

    Hooks.on("deleteActiveEffect", async (effect, options, userId) =>
    {
        logger.debug("GM deleteActiveEffect", effect, options, userId)
        if (!isActiveGM()) return
        debouncedTracker.pulse("deleteActiveEffect")

        const actor = actorRepository.resolveActor(effect?.parent)
        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (transformation) {
            await dispatchTransformationEffectHook("deleteActiveEffect", {
                TransformationClass: transformation.constructor,
                effect,
                actor,
                options,
                userId
            })
        }

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

    Hooks.on("updateItem", async (item, changed, options, userId) =>
    {
        if (!isActiveGM()) return

        await dispatchTransformationItemHook({
            actorRepository,
            transformationQueryService,
            logger
        }, "updateItem",
            item,
            changed,
            options,
            userId
        )
    })

    // Effects flagged with repeatSaveOnDamage ({ability, disadvantage}) let the target repeat
    // the save each time it takes damage (e.g. Fey Dreams and Nightmares). The DC comes from
    // the effect's midi-qol OverTime change, whose roll data DAE has already filled in.
    async function repeatSavesOnDamage(actor)
    {
        logger.debug("repeatSavesOnDamage", actor)

        const effects = Array.from(actor?.effects ?? []).filter(effect =>
            !effect.disabled &&
            effect.getFlag?.("transformations", "repeatSaveOnDamage")
        )

        for (const effect of effects) {
            const config = effect.getFlag("transformations", "repeatSaveOnDamage") ?? {}
            const ability = config.ability
            const dc = resolveOverTimeSaveDc(effect)

            if (!ability || dc == null) {
                logger.warn("repeatSaveOnDamage: missing ability or save DC", {actor, effect})
                continue
            }

            try {
                const rolls = await actor.rollSavingThrow(
                    {
                        ability,
                        target: dc,
                        disadvantage: Boolean(config.disadvantage)
                    },
                    {configure: false}
                )
                const roll = Array.isArray(rolls) ? rolls[0] : rolls
                if (!roll) continue

                const success = roll.isSuccess ?? (Number(roll.total) >= dc)
                if (success && actor.effects.get(effect.id)) {
                    await effect.delete()
                }
            } catch (err) {
                logger.error("Error repeating save on damage", {actor, effect, err})
            }
        }
    }

    function resolveOverTimeSaveDc(effect)
    {
        const overTime = (effect?.changes ?? []).find(change =>
            change.key === "flags.midi-qol.OverTime"
        )
        const match = String(overTime?.value ?? "").match(/saveDC=([^,#]+)/)
        if (!match) return null

        try {
            const dc = Number(Roll.safeEval(match[1].trim()))
            return Number.isFinite(dc) ? dc : null
        } catch (err) {
            logger.warn("repeatSaveOnDamage: could not evaluate save DC", {effect, err})
            return null
        }
    }

    function didLoseHp(actor, previousHp)
    {
        const currentHp = Number(actor?.system?.attributes?.hp?.value ?? NaN)

        if (!Number.isFinite(previousHp) || !Number.isFinite(currentHp)) {
            return false
        }

        return currentHp < previousHp
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

// preUpdate* hooks only run on the client that requests the update, which is often a player.
// These are therefore registered on every client. What they capture travels to the GM's
// update* hooks inside the update options, which Foundry sends along with the update.
export function registerActorPreUpdateHooks({
    actorRepository,
    transformationQueryService,
    logger
})
{
    logger.debug("registerActorPreUpdateHooks", {
        actorRepository,
        transformationQueryService
    })

    Hooks.on("preUpdateActor", (actor, changed, options, userId) =>
    {
        logger.debug("preUpdateActor (previous HP)", actor, changed, options, userId)

        const nextHpValue = getUpdatedHpValue(changed)

        if (nextHpValue == null) {
            return
        }

        const previousHp = Number(actor?.system?.attributes?.hp?.value ?? NaN)
        const actorKey = getActorKey(actor)

        if (!Number.isFinite(previousHp) || !actorKey || !options) {
            return
        }

        options.transformations ??= {}
        options.transformations.previousHp ??= {}
        options.transformations.previousHp[actorKey] = previousHp
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

    Hooks.on("preUpdateItem", async (item, changed, options, userId) =>
    {
        await dispatchTransformationItemHook({
            actorRepository,
            transformationQueryService,
            logger
        }, "preUpdateItem", item, changed, options, userId)
    })
}

async function dispatchTransformationItemHook({
    actorRepository,
    transformationQueryService,
    logger
}, hookName, item, changed, options, userId)
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

function getUpdatedHpValue(changed)
{
    return foundry.utils.getProperty(
        changed,
        "system.attributes.hp.value"
    )
}

function getActorKey(actor)
{
    return actor?.uuid ?? actor?.id ?? null
}

function getPreviousHpFromOptions(actor, options)
{
    const actorKey = getActorKey(actor)
    if (!actorKey) return undefined

    const previousHp = options?.transformations?.previousHp?.[actorKey]
    return previousHp == null ? undefined : Number(previousHp)
}
