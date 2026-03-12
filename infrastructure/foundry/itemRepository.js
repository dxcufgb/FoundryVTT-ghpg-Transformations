export function createItemRepository({
    advancementChoiceHandler,
    tracker,
    debouncedTracker,
    logger
})
{
    logger.debug("createItemRepository", {
        advancementChoiceHandler,
        tracker,
        debouncedTracker
    })

    function findEmbeddedById(actor, itemId)
    {
        logger.debug("createItemRepository.findEmbeddedById", { actor, itemId })
        return actor?.items?.get(itemId) ?? null
    }

    function findEmbeddedByUuidFlag(actor, uuid)
    {
        logger.debug("createItemRepository.findEmbeddedByUuidFlag", { actor, uuid })
        return actor.items.find(
            item =>
                item.getFlag("transformations", "sourceUuid") === uuid
        ) ?? null
    }

    function getEmbeddedAddedByTransformation(actor)
    {
        logger.debug("createItemRepository.getEmbeddedAddedByTransformation", { actor })
        return actor.items.filter(item =>
            item.getFlag("transformations", "addedByTransformation") === true
        )
    }

    function findEmbeddedByType(actor, type)
    {
        logger.debug("createItemRepository.findEmbeddedByType", { actor, type })
        return actor.items.find(item => item.type === type) ?? null
    }

    function findAllEmbeddedByType(actor, type)
    {
        logger.debug("createItemRepository.findAllEmbeddedByType", { actor, type })
        return actor.items.filter(item => item.type === type) ?? null
    }

    async function addTransformationItem({
        actor,
        sourceItem,
        replacesUuid,
        isPrerequisite
    })
    {
        logger.debug("createItemRepository.addTransformationItem", {
            actor,
            sourceItem,
            replacesUuid,
            isPrerequisite
        })
        if (!actor || !sourceItem) return null

        return tracker.track(
            (async () =>
            {
                logger.trace("addTransformationItem called", actor,
                    sourceItem,
                    replacesUuid,
                    isPrerequisite)
                // Prevent duplicates
                const existing = findEmbeddedByUuidFlag(actor, sourceItem.uuid)

                if (existing) {
                    logger.debug(
                        "Transformation item already exists",
                        sourceItem.uuid
                    )
                    return existing
                }

                // Handle replacement
                if (replacesUuid) {
                    const toRemove = findEmbeddedByUuidFlag(actor, replacesUuid)

                    if (toRemove) {
                        await toRemove.delete()
                    }
                }

                const created = createObjectOnActor(actor, sourceItem)
                return created ?? null
            })()
        )
    }


    async function removeTransformationItems(actor)
    {
        logger.debug("createItemRepository.removeTransformationItems", { actor })
        const items = getEmbeddedAddedByTransformation(actor)

        if (!items.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "Item",
                    items.map(i => i.id)
                )
            })()
        )
    }


    async function addItemFromUuid({
        actor,
        uuid,
        flags = {},
        preventDuplicate = true
    })
    {
        logger.debug("createItemRepository.addItemFromUuid", {
            actor,
            uuid,
            flags,
            preventDuplicate
        })
        if (!actor) {
            throw new Error("addItemFromUuid requires actor")
        }

        if (!uuid) {
            throw new Error("addItemFromUuid requires uuid")
        }

        if (preventDuplicate) {
            const existing = actor.items.find(
                i => i.flags?.transformations?.sourceUuid === uuid
            )

            if (existing) {
                logger?.trace?.(
                    "Item already exists on actor, skipping",
                    uuid
                )
                return existing
            }
        }

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("fromUUID")
                const source = await fromUuid(uuid)

                if (!source) {
                    logger?.warn?.("Item not found for UUID", uuid)
                    return null
                }

                const created = createObjectOnActor(actor, source)

                logger?.trace?.(
                    "Transformation item added",
                    actor.id,
                    uuid,
                    created?.id
                )

                return created
            })()
        )

    }

    async function createEmbedded(actor, itemData)
    {
        logger.debug("createItemRepository.createEmbedded", { actor, itemData })
        if (!actor || !itemData) return null
        logger.trace("createEmbedded called", actor, itemData)

        return tracker.track(
            (async () =>
            {
                const created = createObjectOnActor(actor, itemData)
                return created ?? null
            })()
        )
    }


    async function deleteEmbedded(actor, itemIds)
    {
        logger.debug("createItemRepository.deleteEmbedded", { actor, itemIds })
        if (!actor || !itemIds?.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments("Item", itemIds)
            })()
        )
    }


    async function updateEmbedded(item, update)
    {
        logger.debug("createItemRepository.updateEmbedded", { item, update })
        if (!item || !update) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("pre item.update")
                await item.update(update)
                debouncedTracker.pulse("post item.update")
            })()
        )
    }

    function getTransformationFlags(item)
    {
        logger.debug("createItemRepository.getTransformationFlags", { item })
        return item.getFlag("transformations", "") ?? {}
    }

    function getSourceUuid(item)
    {
        logger.debug("createItemRepository.getSourceUuid", { item })
        return item.getFlag("transformations", "sourceUuid") ?? null
    }

    function isAddedByTransformation(item)
    {
        logger.debug("createItemRepository.isAddedByTransformation", { item })
        return item.getFlag("transformations", "addedByTransformation") === true
    }

    async function setTransformationFlags(item, flags)
    {
        logger.debug("createItemRepository.setTransformationFlags", { item, flags })
        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("clearTransformation")
                await item.setFlag("transformations", "", flags)
            })()
        )
    }


    async function clearTransformationFlags(item)
    {
        logger.debug("createItemRepository.clearTransformationFlags", { item })
        const scope = item.flags?.transformations
        if (!scope) return

        return tracker.track(
            (async () =>
            {

                const updates = {}
                for (const key of Object.keys(scope)) {
                    updates[`flags.transformations.-=${key}`] = null
                }

                debouncedTracker.pulse("item.update")
                await item.update(updates)
            })()
        )
    }


    function getRemainingUses(item)
    {
        logger.debug("createItemRepository.getRemainingUses", { item })
        if (!item) return 0

        const uses = item.system?.uses
        if (!uses) return 0

        const max = Number(uses.max) || 0
        const spent = Number(uses.spent) || 0

        return Math.max(0, max - spent)
    }

    async function consumeUses(item, amount = 1)
    {
        logger.debug("createItemRepository.consumeUses", { item, amount })
        if (!item || amount <= 0) return false

        const uses = item.system?.uses
        if (!uses) return false

        const max = Number(uses.max) || 0
        const spent = Number(uses.spent) || 0

        if (max === 0) {
            // Unlimited uses item
            return true
        }

        const remaining = Math.max(0, max - spent)

        if (remaining < amount) {
            return false
        }

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("item.update")
                await item.update({
                    "system.uses.spent": spent + amount
                })

                return true
            })()
        )
    }


    async function removeBySourceUuid(actor, sourceUuids)
    {
        logger.debug("createItemRepository.removeBySourceUuid", { actor, sourceUuids })
        if (!actor || !sourceUuids) return 0

        const uuids = Array.isArray(sourceUuids)
            ? sourceUuids
            : [sourceUuids]

        const itemsToRemove = actor.items.filter(item =>
            uuids.includes(
                item.flags?.transformations?.sourceUuid
            )
        )

        if (!itemsToRemove.length) return 0

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "Item",
                    itemsToRemove.map(i => i.id)
                )

                return itemsToRemove.length
            })()
        )
    }


    function getItemsRemoveOnLongRest(actor)
    {
        logger.debug("createItemRepository.getItemsRemoveOnLongRest", { actor })
        if (!actor) return []

        return actor.items.filter(item =>
            item.getFlag("transformations", "removeOnLongRest") === true
        )
    }

    async function removeItemsOnLongRest(actor)
    {
        logger.debug("createItemRepository.removeItemsOnLongRest", { actor })
        const items = getItemsRemoveOnLongRest(actor)
        if (!items.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "Item",
                    items.map(i => i.id)
                )
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        // queries
        findEmbeddedById,
        findEmbeddedByUuidFlag,
        getEmbeddedAddedByTransformation,
        findEmbeddedByType,
        findAllEmbeddedByType,
        getRemainingUses,
        consumeUses,

        // mutations
        addTransformationItem,
        addItemFromUuid,
        removeTransformationItems,
        createEmbedded,
        deleteEmbedded,
        updateEmbedded,
        removeBySourceUuid,
        removeItemsOnLongRest,

        // flags
        getTransformationFlags,
        getSourceUuid,
        isAddedByTransformation,
        setTransformationFlags,
        clearTransformationFlags
    })

    async function applyAdvancements(actor, advancements, parentItem)
    {
        logger.debug("itemRepository.applyAdvancements", {
            actor,
            advancements,
            parentItem
        })
        for (const advancement of advancements) {
            const advancementConfiguration = advancement.configuration
            if (advancementConfiguration.items) {
                for (const item of advancementConfiguration.items) {
                    const sourceItem = await fromUuid(item.uuid)
                    await createObjectOnActor(
                        actor,
                        sourceItem,
                        parentItem?.uuid ?? ""
                    )
                }
            }
            if (advancementConfiguration.choices) {
                for (const choices of advancementConfiguration.choices) {
                    if (choices.count == 1) {
                        const choicePool = Array.isArray(choices?.pool)
                            ? choices.pool
                            : Array.isArray(choices?.choices)
                                ? choices.choices
                                : Array.isArray(choices)
                                    ? choices
                                    : []

                        const choiceApplied = await advancementChoiceHandler.choose({
                            actor,
                            advancementChoices: choicePool,
                            sourceItem: parentItem
                        })

                        if (!choiceApplied) {
                            logger.warn(
                                "Advancement choice skipped: no supported selection returned",
                                choices
                            )
                            continue
                        }
                    }
                }
            }
        }
    }

    async function createObjectOnActor(actor, sourceItem, awardedByItem = "")
    {
        const data = sourceItem.toObject()
        data.flags ??= {}
        data.flags.transformations = {
            sourceUuid: sourceItem.uuid,
            definitionId: actor.flags.transformations.type,
            stage: actor.flags.transformations.stage,
            addedByTransformation: true,
            awardedByItem: awardedByItem
        }
        data.flags.ddbimporter = { ignoreItemImport: true }
        debouncedTracker.pulse("createEmbeddedDocuments")
        const [created] = await actor.createEmbeddedDocuments("Item", [data])

        if (created && data.system.advancement && data.system.advancement.length > 0) {
            await applyAdvancements(actor, data.system.advancement, created)
        }

        return created
    }
}
