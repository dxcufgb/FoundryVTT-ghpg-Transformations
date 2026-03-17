export function createActorRepository({
    tracker,
    debouncedTracker,
    itemRepository,
    getGame,
    logger
})
{
    logger.debug("createActorRepository", {
        tracker,
        debouncedTracker,
        getGame
    })

    function getById(actorId)
    {
        logger.debug("createActorRepository.getById", {actorId})
        const actor = getGame().actors.get(actorId) ?? null
        if (!actor) logger.warn("Actor not found", actorId)
        return actor
    }

    async function getByUuid(uuid)
    {
        logger.debug("createActorRepository.getByUuid", {uuid})
        if (!uuid || typeof uuid !== "string") {
            logger?.warn?.(
                "actorRepository.getByUuid called with invalid uuid",
                uuid
            )
            return null
        }

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("fromUUID")
                let doc
                try {
                    doc = await fromUuid(uuid)
                } catch (err) {
                    logger?.error?.(
                        "Failed to resolve actor UUID",
                        uuid,
                        err
                    )
                    return null
                }

                if (!doc || doc.documentName !== "Actor") {
                    logger?.warn?.(
                        "UUID did not resolve to Actor",
                        uuid,
                        doc
                    )
                    return null
                }

                return doc
            })()
        )
    }

    function getActiveTransformationId(actor)
    {
        logger.debug("createActorRepository.getActiveTransformationId", {actor})
        return actor?.flags?.transformations?.type ?? null
    }

    function getTransformationStage(actor)
    {
        logger.debug("createActorRepository.getTransformationStage", {actor})
        return actor?.flags?.transformations?.stage ?? 1
    }

    async function setTransformation(actor, transformationId, stage = 0)
    {
        logger.debug("createActorRepository.setTransformation", {actor, transformationId, stage})
        return tracker.track(
            (async () =>
            {
                await actor.update({
                    "flags.transformations.type": transformationId,
                    "flags.transformations.stage": stage,
                    "flags.transformations.fallbackActorId": actor.id
                })
            })()
        )
    }

    async function clearTransformation(actor)
    {
        logger.debug("createActorRepository.clearTransformation", {actor})
        return tracker.track(
            (async () =>
            {
                const updates = await getClearTransformationUpdates(actor)
                await actor.update(updates)
            })()
        )
    }

    async function setTransformationStage(actor, stage)
    {
        logger.debug("createActorRepository.setStage", {actor, stage})
        return tracker.track(
            (async () =>
            {
                await actor.update({
                    "flags.transformations.stage": stage
                })
            })()
        )
    }

    function getCreatureTypeFlags(actor)
    {
        logger.debug("createActorRepository.getCreatureTypeFlags", {actor})
        return actor.getFlag("transformations", "creatureTypes") ?? null
    }

    async function setCreatureTypeFlags(actor, flags)
    {
        logger.debug("createActorRepository.setCreatureTypeFlags", {actor, flags})
        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("applyCreatureType")
                await actor.setFlag("transformations", "creatureTypes", flags)
            })()
        )
    }

    async function clearCreatureTypeFlags(actor)
    {
        logger.debug("createActorRepository.clearCreatureTypeFlags", {actor})
        return tracker.track(
            (async () =>
            {
                await actor.unsetFlag("transformations", "creatureTypes")
            })()
        )
    }

    async function clearAllMacroExecutionsForActor(actor)
    {
        logger.debug("createActorRepository.clearAllMacroExecutionsForActor", {actor})
        return tracker.track(
            (async () =>
            {
                if (!actor?.getFlag("transformations", "macroExecutions")) return
                await actor.unsetFlag("transformations", "macroExecutions")
            })()
        )
    }

    async function setMacroExecution(actor, flagKey)
    {
        logger.debug("createActorRepository.setMacroExecution", {actor, flagKey})
        return tracker.track(
            (async () =>
            {
                const executions = actor.getFlag("transformations", "macroExecutions") ?? {}

                debouncedTracker.pulse("macroExecution")
                await actor.setFlag("transformations", "macroExecutions", {
                    ...executions,
                    [flagKey]: true
                })

                logger?.trace?.(
                    "Macro execution lock set",
                    actor.id,
                    flagKey
                )
            })()
        )
    }

    async function clearMacroExecution(actor, flagKey)
    {
        logger.debug("createActorRepository.clearMacroExecution", {actor, flagKey})
        return tracker.track(
            (async () =>
            {
                const executions = actor.getFlag("transformations", "macroExecutions")

                if (!executions || !(flagKey in executions)) return

                const {[flagKey]: _, ...remaining} = executions

                if (Object.keys(remaining).length === 0) {
                    await actor.unsetFlag(
                        "transformations",
                        "macroExecutions"
                    )
                } else {
                    debouncedTracker.pulse("macroExecution")
                    await actor.setFlag(
                        "transformations",
                        "macroExecutions",
                        remaining
                    )
                }

                logger?.trace?.(
                    "Macro execution lock cleared",
                    actor.id,
                    flagKey
                )
            })()
        )
    }

    function hasMacroExecution(actor, flagKey)
    {
        logger.debug("createActorRepository.hasMacroExecution", {actor, flagKey})
        const executions =
                  actor.getFlag("transformations", "macroExecutions")

        return Boolean(executions?.[flagKey])
    }

    function resolveActor(target)
    {
        logger.debug("createActorRepository.resolveActor", {target})
        if (!target) return null

        // TokenDocument â†’ synthetic actor
        if (target.documentName === "Token") {
            return target.actor ?? null
        }

        // Token object â†’ synthetic actor
        if (target.isToken) {
            return target.actor ?? target.parent?.actor ?? null
        }

        // Actor
        if (target.documentName === "Actor") {
            return target
        }

        return null
    }

    async function addExhaustionLevels(actor, levels)
    {
        logger.debug("createActorRepository.addExhaustionLevels", {actor, levels})
        if (!actor) return

        return tracker.track(
            (async () =>
            {
                const current = Number(actor.system?.attributes?.exhaustion) || 0
                const value = Math.clamp(current + levels, 0, 6)

                logger.debug(
                    "Updating exhaustion",
                    actor.id,
                    current,
                    "â†’",
                    value
                )

                await actor.update({
                    "system.attributes.exhaustion": value
                })
            })()
        )
    }

    async function setActorDeathSaves(actor, saves, mode)
    {
        logger.debug("createActorRepository.setActorDeathSaves", {actor, saves, mode})
        if (!actor) return

        return tracker.track(
            (async () =>
            {
                if (!["success", "failure"].includes(mode)) {
                    throw new Error(`Invalid death save mode '${mode}'`)
                }

                const value = Math.clamp(Number(saves) || 0, 0, 3)

                await actor.update({
                    [`system.attributes.death.${mode}`]: value
                })
            })()
        )
    }

    async function setActorHp(actor, hp, type = "value")
    {
        logger.debug("createActorRepository.setActorHp", {actor, hp, type})
        if (!actor) return

        if (!["value", "temp", "effectiveMax"].includes(type)) {
            throw new Error(`Invalid HP type '${type}'`)
        }

        return tracker.track(
            (async () =>
            {
                const path = `system.attributes.hp.${type}`

                await actor.update({
                    [path]: hp
                })

                if (type == "effectiveMax") {
                    const valuePath = `system.attributes.hp.value`

                    await actor.update({
                        [valuePath]: hp
                    })
                }
            })()
        )
    }

    function getNumericAttributeEffectChanges(actor, {
        basePath,
        bonus,
        mode = CONST.ACTIVE_EFFECT_MODES.ADD,
        filter = v => v > 0
    })
    {
        logger.debug("createActorRepository.getNumericAttributeEffectChanges", {
            actor,
            basePath,
            bonus,
            mode
        })
        if (!actor) return []

        const values = foundry.utils.getProperty(actor.system, basePath)
        if (!values) return []

        const effects = []

        for (const [key, value] of Object.entries(values)) {
            if (filter(value)) {
                effects.push({
                    key: `${basePath}.${key}`,
                    mode,
                    value: bonus
                })
            }
        }

        return effects
    }

    async function addTempHp(actor, amount)
    {
        logger.debug("createActorRepository.addTempHp", {actor, amount})
        return tracker.track(
            (async () =>
            {
                const current = actor.system.attributes.hp.temp ?? 0
                await actor.update({
                    "system.attributes.hp.temp": Math.max(current, amount)
                })
            })()
        )
    }

    async function addHp(actor, amount)
    {
        logger.debug("createActorRepository.addHp", {actor, amount})
        return tracker.track(
            (async () =>
            {
                const {value, max} = actor.system.attributes.hp
                await actor.update({
                    "system.attributes.hp.value": Math.min(value + amount, max)
                })
            })()
        )
    }

    async function applyDamage(actor, amount)
    {
        logger.debug("createActorRepository.applyDamage", {actor, amount})
        return tracker.track(
            (async () =>
            {
                const {value} = actor.system.attributes.hp
                await actor.update({
                    "system.attributes.hp.value": Math.max(value - amount, 0)
                })
            })()
        )
    }

    async function setMovementBonus(actor, movementBonus)
    {
        logger.debug("createActorRepository.setMovementBonus", {actor, movementBonus})
        return tracker.track(
            (async () =>
            {
                await actor.update({
                    "system.attributes.movement.bonus": String(movementBonus)
                })
            })()
        )
    }

    function hasAnySpellSlotCapacity(actor)
    {
        logger.debug("createActorRepository.hasAnySpellSlotCapacity", {actor})
        const spells = actor.system?.spells
        if (!spells) return false

        return Object.values(spells).some(slot =>
            typeof slot?.max === "number" && slot.max > 0
        )
    }

    function getAvailableHitDice(actor)
    {
        const hitDiePerClass = getHitDiePerClass(actor)

        const total = Object.values(hitDiePerClass)
        .reduce((sum, entry) => sum + (entry?.value ?? 0), 0)

        logger?.debug?.("actorRepository.getAvailableHitDice", {total})

        return total
    }

    function getMaximumHitDices(actor)
    {
        const hitDiePerClass = getHitDiePerClass(actor)

        const total = Object.values(hitDiePerClass)
        .reduce((sum, entry) => sum + (entry?.max ?? 0), 0)

        logger?.debug?.("actorRepository.getMaximumHitDices", {total})

        return total
    }

    function getHighestAvailableHitDice(actor) {
        const hitDicesPerClass = getHitDiePerClass(actor)
        let hitDie = ""

        for (const hitDice of Object.values(hitDicesPerClass)) {
            if (hitDice.value > 0) {
                hitDie = hitDice
                break
            }
        }
        return hitDie
    }

    function getHitDiePerClass(actor)
    {
        const classItems = itemRepository.findAllEmbeddedByType(actor, "class")
        let hitDieSummary = Object.fromEntries(
            [...classItems]
            .sort((a, b) => Number.parseInt(b.system.hd.denomination.replace(
                "d",
                ""
            )) - Number.parseInt(a.system.hd.denomination.replace("d", "")))
            .map(n => [n.name, {
                denomination: n.system.hd.denomination,
                max: n.system.hd.max,
                spent: n.system.hd.spent,
                additional: n.system.hd.additional,
                value: n.system.hd.value
            }])
        )
        return hitDieSummary
    }

    async function consumeHitDie(actor, amount)
    {
        if (!actor || amount <= 0) return
        let remainingToConsume = amount
        const classItems = itemRepository.findAllEmbeddedByType(actor, "class")

        const hitDiePerClass = getHitDiePerClass(actor)

        const updatePromises = []

        for (const [key, entry] of Object.entries(hitDiePerClass)) {

            if (remainingToConsume <= 0) break

            const currentClassItem = classItems.find(c => c.name === key) // fixed comparison

            if (!currentClassItem) continue

            const available = entry?.value ?? 0
            if (available <= 0) continue
            const currentValue = currentClassItem.system.hd.value ?? 0
            const currentSpent = currentClassItem.system.hd.spent ?? 0

            const spend = Math.min(currentValue, remainingToConsume)

            remainingToConsume -= spend

            updatePromises.push(
                currentClassItem.update({
                    "system.hd.value": currentValue - spend,
                    "system.hd.spent": currentSpent + spend
                })
            )

            logger?.debug?.("actorRepository.consumeHitDie", {
                class: key,
                classRemaining: available,
                requestedTotal: amount,
                currentRemainingToConsume: remainingToConsume
            })
        }

        // Await all updates at once
        if (updatePromises.length > 0) {
            await Promise.all(updatePromises)
        }

        if (remainingToConsume > 0) {
            logger?.warn?.(
                "actorRepository.consumeHitDie: Not enough hit dice to fulfill request"
            )
        }

    }

    function getExhaustion(actor)
    {
        const value = actor?.system?.attributes?.exhaustion ?? 0
        logger?.debug?.("actorRepository.getExhaustion", {value})
        return value
    }

    async function removeExhaustion(actor, amount)
    {
        if (!actor || amount <= 0) return

        const current = getExhaustion(actor)
        const next = Math.max(current - amount, 0)

        logger?.debug?.("actorRepository.removeExhaustion", {
            current,
            amount,
            next
        })

        if (next === current) return

        await actor.update({
            "system.attributes.exhaustion": next
        })
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        getById,
        getByUuid,
        getActiveTransformationId,
        getTransformationStage,
        getCreatureTypeFlags,
        resolveActor,

        setCreatureTypeFlags,
        setTransformation,

        clearCreatureTypeFlags,
        clearTransformation,
        setTransformationStage,

        hasMacroExecution,
        setMacroExecution,
        clearMacroExecution,
        clearAllMacroExecutionsForActor,

        addExhaustionLevels,
        setActorHp,
        setActorDeathSaves,
        getNumericAttributeEffectChanges,
        addHp,
        addTempHp,
        applyDamage,
        setMovementBonus,
        hasAnySpellSlotCapacity,
        getAvailableHitDice,
        getMaximumHitDices,
        getHighestAvailableHitDice,
        consumeHitDie,
        getExhaustion,
        removeExhaustion
    })

    async function getClearTransformationUpdates(actor)
    {
        logger.debug("createActorRepository.getClearTransformationUpdates", {actor})
        return tracker.track(
            (async () =>
            {
                const scope = actor.flags?.transformations

                if (!scope || typeof scope !== "object") {
                    return
                }

                const keys = Object.keys(scope)

                if (keys.length === 0) {
                    return
                }

                const updates = {
                    "flags.transformations.type": null,
                    "flags.transformations.stage": 1
                }

                for (const key of keys) {
                    updates[`flags.transformations.-=${key}`] = null
                }
                return updates
            })()
        )
    }
}
