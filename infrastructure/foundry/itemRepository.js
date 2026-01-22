export function createItemRepository({ logger }) {

    // ─────────────────────────────────────────────────────────────
    // Queries
    // ─────────────────────────────────────────────────────────────

    function findEmbeddedById(actor, itemId) {
        return actor?.items?.get(itemId) ?? null;
    }

    function findEmbeddedByUuidFlag(actor, uuid) {
        return actor.items.find(
            item =>
                item.getFlag("transformations", "sourceUuid") === uuid
        ) ?? null;
    }

    function getEmbeddedAddedByTransformation(actor) {
        return actor.items.filter(item =>
            item.getFlag("transformations", "addedByTransformation") === true
        );
    }

    function findEmbeddedByType(actor, type) {
        return actor.items.find(item => item.type === type) ?? null;
    }

    // ─────────────────────────────────────────────────────────────
    // Mutations
    // ─────────────────────────────────────────────────────────────

    async function addTransformationItem({
        actor,
        sourceItem,
        context,
        replacesUuid,
        isPrerequisite
    }) {
        if (!actor || !sourceItem) return null;
        logger.trace("addTransformationItem called", actor,
            sourceItem,
            context,
            replacesUuid,
            isPrerequisite);
        // 1️⃣ Prevent duplicates
        const existing = findEmbeddedByUuidFlag(actor, sourceItem.uuid);

        if (existing) {
            logger.debug(
                "Transformation item already exists",
                sourceItem.uuid
            );
            return existing;
        }

        // 2️⃣ Handle replacement
        if (replacesUuid) {
            const toRemove = findEmbeddedByUuidFlag(actor, replacesUuid);

            if (toRemove) {
                await toRemove.delete();
            }
        }

        // 3️⃣ Create embedded item with canonical flags
        const data = sourceItem.toObject();
        data.flags ??= {};
        data.flags.transformations = {
            sourceUuid: sourceItem.uuid,
            definitionId: context.definitionId,
            stage: context.stage,
            isPrerequisite: Boolean(isPrerequisite),
            addedByTransformation: true
        };

        const [created] = await actor.createEmbeddedDocuments("Item", [data]);

        return created ?? null;
    }

    async function removeTransformationItems(actor) {
        const items = getEmbeddedAddedByTransformation(actor);

        if (!items.length) return;

        await actor.deleteEmbeddedDocuments(
            "Item",
            items.map(i => i.id)
        );
    }

    async function addItemFromUuid({
        actor,
        uuid,
        flags = {},
        preventDuplicate = true
    }) {
        if (!actor) {
            throw new Error("addItemFromUuid requires actor");
        }

        if (!uuid) {
            throw new Error("addItemFromUuid requires uuid");
        }

        if (preventDuplicate) {
            const existing = actor.items.find(
                i => i.flags?.transformations?.sourceUuid === uuid
            );

            if (existing) {
                logger?.trace?.(
                    "Item already exists on actor, skipping",
                    uuid
                );
                return existing;
            }
        }

        const source = await fromUuid(uuid);

        if (!source) {
            logger?.warn?.("Item not found for UUID", uuid);
            return null;
        }

        const data = source.toObject();

        data.flags ??= {};
        data.flags.transformations = {
            sourceUuid: uuid,
            addedByTransformation: true,
            ...flags
        };

        const [created] = await actor.createEmbeddedDocuments("Item", [data]);

        logger?.trace?.(
            "Transformation item added",
            actor.id,
            uuid,
            created?.id
        );

        return created;
    }

    async function createEmbedded(actor, itemData) {
        if (!actor || !itemData) return null;
        logger.trace("createEmbedded called", actor, itemData);

        const data = itemData.toObject();
        data.flags ??= {};
        data.flags.transformations = {
            sourceUuid: sourceItem.uuid,
            addedByTransformation: true
        };

        const [created] = await actor.createEmbeddedDocuments("Item", [itemData]);

        return created ?? null;
    }

    async function deleteEmbedded(actor, itemIds) {
        if (!actor || !itemIds?.length) return;

        await actor.deleteEmbeddedDocuments("Item", itemIds);
    }

    async function updateEmbedded(item, update) {
        if (!item || !update) return;
        await item.update(update);
    }

    // ─────────────────────────────────────────────────────────────
    // Flag helpers (single source of truth)
    // ─────────────────────────────────────────────────────────────

    function getTransformationFlags(item) {
        return item.getFlag("transformations", "") ?? {};
    }

    function getSourceUuid(item) {
        return item.getFlag("transformations", "sourceUuid") ?? null;
    }

    function isAddedByTransformation(item) {
        return item.getFlag("transformations", "addedByTransformation") === true;
    }

    async function setTransformationFlags(item, flags) {
        await item.setFlag("transformations", "", flags);
    }

    async function clearTransformationFlags(item) {
        const scope = item.flags?.transformations;
        if (!scope) return;

        const updates = {};
        for (const key of Object.keys(scope)) {
            updates[`flags.transformations.-=${key}`] = null;
        }

        await item.update(updates);
    }

    return Object.freeze({
        // queries
        findEmbeddedById,
        findEmbeddedByUuidFlag,
        getEmbeddedAddedByTransformation,
        findEmbeddedByType,

        // mutations
        addTransformationItem,
        addItemFromUuid,
        removeTransformationItems,
        createEmbedded,
        deleteEmbedded,
        updateEmbedded,

        // flags
        getTransformationFlags,
        getSourceUuid,
        isAddedByTransformation,
        setTransformationFlags,
        clearTransformationFlags
    });
}
