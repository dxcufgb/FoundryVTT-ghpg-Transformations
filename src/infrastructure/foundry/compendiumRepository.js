export function createCompendiumRepository({
    tracker,
    getGame,
    fromUuid,
    debouncedTracker,
    logger
})
{
    logger.debug("createCompendiumRepository", {
        tracker,
        getGame,
        fromUuid,
        debouncedTracker
    })

    const documentCache = new Map()
    const packCache = new Map()

    async function loadPack(packId)
    {
        logger.debug("createCompendiumRepository.loadPack", { packId })
        if (packCache.has(packId)) {
            return packCache.get(packId)
        }

        const pack = getGame().packs.get(packId)
        if (!pack) {
            logger.warn("Compendium not found", packId)
            return null
        }

        return tracker.track(
            (async () =>
            {

                await pack.getIndex()
                packCache.set(packId, pack)
                return pack
            })()
        )
    }

    async function getDocumentByUuid(uuid)
    {
        logger.debug("createCompendiumRepository.getDocumentByUuid", { uuid })
        if (!uuid || typeof uuid !== "string") {
            logger.warn("Invalid UUID", uuid)
            return null
        }

        if (documentCache.has(uuid)) {
            return documentCache.get(uuid)
        }

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("fromUUID")
                let doc
                try {
                    doc = await fromUuid(uuid)
                } catch (err) {
                    logger.error("Failed to resolve UUID", uuid, err)
                    return null
                }

                if (!doc) {
                    logger.warn("Document not found", uuid)
                    return null
                }

                documentCache.set(uuid, doc)
                return doc
            })()
        )
    }

    async function getDocumentFromPack(packId, documentId)
    {
        logger.debug("createCompendiumRepository.getDocumentFromPack", { packId, documentId })
        return tracker.track(
            (async () =>
            {
                const pack = await loadPack(packId)
                if (!pack) return null

                const doc = await pack.getDocument(documentId)
                if (!doc) {
                    logger.warn(
                        "Document not found in pack",
                        packId,
                        documentId
                    )
                }

                return doc
            })()
        )
    }

    async function getDocumentByName(packId, name)
    {
        logger.debug("createCompendiumRepository.getDocumentByName", { packId, name })
        return tracker.track(
            (async () =>
            {
                const pack = await loadPack(packId)
                if (!pack) return null

                const index = pack.index ?? await pack.getIndex()
                const entry = index.find(e => e.name === name)

                if (!entry) {
                    logger.warn(
                        "Document not found by name",
                        packId,
                        name
                    )
                    return null
                }

                return pack.getDocument(entry._id)
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        loadPack,
        getDocumentByUuid,
        getDocumentFromPack,
        getDocumentByName
    })
}
