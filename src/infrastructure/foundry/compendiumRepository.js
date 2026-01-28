export function createCompendiumRepository({
    getGame,
    fromUuid,
    logger
}) {
    const documentCache = new Map();
    const packCache = new Map();

    // ─────────────────────────────────────────────────────────────
    // Packs
    // ─────────────────────────────────────────────────────────────

    async function loadPack(packId) {
        if (packCache.has(packId)) {
            return packCache.get(packId);
        }

        const pack = getGame().packs.get(packId);
        if (!pack) {
            logger.warn("Compendium not found", packId);
            return null;
        }

        await pack.getIndex();
        packCache.set(packId, pack);
        return pack;
    }

    // ─────────────────────────────────────────────────────────────
    // Documents
    // ─────────────────────────────────────────────────────────────

    async function getDocumentByUuid(uuid) {
        if (!uuid || typeof uuid !== "string") {
            logger.warn("Invalid UUID", uuid);
            return null;
        }

        if (documentCache.has(uuid)) {
            return documentCache.get(uuid);
        }

        let doc;
        try {
            doc = await fromUuid(uuid);
        } catch (err) {
            logger.error("Failed to resolve UUID", uuid, err);
            return null;
        }

        if (!doc) {
            logger.warn("Document not found", uuid);
            return null;
        }

        documentCache.set(uuid, doc);
        return doc;
    }

    async function getDocumentFromPack(packId, documentId) {
        const pack = await loadPack(packId);
        if (!pack) return null;

        const doc = await pack.getDocument(documentId);
        if (!doc) {
            logger.warn(
                "Document not found in pack",
                packId,
                documentId
            );
        }

        return doc;
    }

    async function getDocumentByName(packId, name) {
        const pack = await loadPack(packId);
        if (!pack) return null;

        const index = pack.index ?? await pack.getIndex();
        const entry = index.find(e => e.name === name);

        if (!entry) {
            logger.warn(
                "Document not found by name",
                packId,
                name
            );
            return null;
        }

        return pack.getDocument(entry._id);
    }

    return Object.freeze({
        loadPack,
        getDocumentByUuid,
        getDocumentFromPack,
        getDocumentByName
    });
}
