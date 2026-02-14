export function createCreatureTypeService({
    tracker,
    debouncedTracker,
    actorRepository,
    itemRepository,
    utils,
    logger
})
{
    async function applyCreatureSubType(actor, creatureSubType)
    {
        if (!actor || !creatureSubType) return

        const baseType = actor.system.details.type.value

        logger.debug(
            "Applying creature subtype",
            actor.id,
            baseType,
            creatureSubType
        )

        return tracker.track(
            (async () =>
            {

                await actorRepository.setCreatureTypeFlags(actor, {
                    base: baseType,
                    added: [creatureSubType]
                })

                const raceItem = itemRepository.findEmbeddedByType(actor, "race")

                if (raceItem) {
                    await itemRepository.updateEmbedded(raceItem, {
                        "system.type.value": raceItem.system.type.value ?? "humanoid",
                        "system.type.subtype": utils.stringUtils.capitalize(creatureSubType)
                    })
                }
            })()
        )
    }

    async function restoreBaseCreatureType(actor)
    {
        if (!actor) return

        const flags = actorRepository.getCreatureTypeFlags(actor)

        if (!flags) return

        const { base, added = [] } = flags

        logger.debug(
            "Restoring base creature type",
            actor.id,
            base,
            added
        )

        const currentSubtype = actor.system.details.type.subtype

        return tracker.track(
            (async () =>
            {

                if (currentSubtype && added.includes(currentSubtype)) {
                    const raceItem = itemRepository.findEmbeddedByType(actor, "race")

                    if (raceItem) {
                        await itemRepository.updateEmbedded(raceItem, {
                            "system.type.subtype": ""
                        })
                    }
                }

                if (actor.system.details.type.value !== base) {
                    debouncedTracker.pulse("actor.update")
                    await actor.update({
                        "system.details.type.value": base
                    })
                }
                await actorRepository.clearCreatureTypeFlags(actor)
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        applyCreatureSubType,
        restoreBaseCreatureType
    })
}
