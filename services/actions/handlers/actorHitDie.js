import { resolveValue } from "../utils/resolveValue.js"

export function createActorHitDieAction({
    actorRepository,
    itemRepository,
    tracker,
    logger
})
{
    logger.debug("createActorHitDieAction", {
        actorRepository,
        itemRepository,
        tracker
    })

    return async function ACTOR_HIT_DIE({
        actor,
        action,
        context,
        variables
    })
    {
        logger.debug("createActorHitDieAction.ACTOR_HIT_DIE", {
            actor,
            action,
            context,
            variables
        })

        const { mode, value, preferLower = false } = action.data ?? {}

        if (!mode || value == null) {
            logger.warn("ACTOR_HIT_DIE action missing mode or value", action)
            return false
        }

        const resolvedValue = Number(
            resolveValue(value, context, variables, logger)
        )

        if (Number.isNaN(resolvedValue)) {
            logger.warn(
                "ACTOR_HIT_DIE action value is not a number",
                value
            )
            return false
        }

        if (!actor) {
            logger.warn("ACTOR_HIT_DIE: Missing actor")
            return false
        }

        return tracker.track(
            (async () =>
            {
                switch (mode) {
                    case "set":
                        return setRemainingHitDice(
                            actor,
                            resolvedValue,
                            { preferLower }
                        )

                    default:
                        logger.warn(
                            "Unknown ACTOR_HIT_DIE action mode",
                            mode,
                            action
                        )
                        return false
                }
            })()
        )
    }

    async function setRemainingHitDice(
        actor,
        targetValue,
        {
            preferLower = false
        } = {}
    )
    {
        logger.debug("createActorHitDieAction.setRemainingHitDice", {
            actor,
            targetValue,
            preferLower
        })

        const classItems = itemRepository.findAllEmbeddedByType(actor, "class")

        if (!classItems?.length) {
            logger.warn(
                "ACTOR_HIT_DIE.set: actor has no class items",
                actor
            )
            return false
        }

        const currentRemaining = actorRepository.getAvailableHitDice(actor)
        const totalCapacity = classItems.reduce((sum, classItem) =>
            sum +
            (Number(classItem.system?.hd?.value) || 0) +
            (Number(classItem.system?.hd?.spent) || 0),
        0)

        const requestedRemaining = Math.min(
            Math.max(Math.floor(targetValue), 0),
            totalCapacity
        )
        const targetRemaining = preferLower
            ? Math.min(currentRemaining, requestedRemaining)
            : requestedRemaining

        if (targetRemaining === currentRemaining) {
            return false
        }

        if (targetRemaining < currentRemaining) {
            await actorRepository.consumeHitDie(
                actor,
                currentRemaining - targetRemaining
            )
            return true
        }

        let remainingToRestore = targetRemaining - currentRemaining

        const updatePromises = []
        const sortedClassItems = [...classItems].sort((a, b) =>
            parseHitDieDenomination(b) - parseHitDieDenomination(a)
        )

        for (const classItem of sortedClassItems) {
            if (remainingToRestore <= 0) break

            const currentSpent = Number(classItem.system?.hd?.spent) || 0
            if (currentSpent <= 0) continue

            const currentValue = Number(classItem.system?.hd?.value) || 0
            const restore = Math.min(currentSpent, remainingToRestore)

            remainingToRestore -= restore

            updatePromises.push(
                classItem.update({
                    "system.hd.value": currentValue + restore,
                    "system.hd.spent": currentSpent - restore
                })
            )
        }

        if (updatePromises.length > 0) {
            await Promise.all(updatePromises)
        }

        if (remainingToRestore > 0) {
            logger.warn(
                "ACTOR_HIT_DIE.set: Unable to restore requested hit dice amount",
                {
                    actorId: actor.id,
                    targetRemaining,
                    currentRemaining,
                    remainingToRestore
                }
            )
            return false
        }

        return true
    }

    function parseHitDieDenomination(classItem)
    {
        return Number.parseInt(
            String(classItem?.system?.hd?.denomination ?? "d0").replace("d", ""),
            10
        ) || 0
    }
}
