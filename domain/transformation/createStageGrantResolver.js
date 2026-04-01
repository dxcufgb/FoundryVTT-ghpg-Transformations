export function createStageGrantResolver({
    requiresService,
    logger
})
{
    logger.debug("createStageGrantResolver", {})

    function resolve({
        actor,
        definition,
        stage
    })
    {
        logger.debug("createStageGrantResolver.resolve", {definition, stage})
        if (!definition || !stage) {
            return empty()
        }

        const stageDef =
                  definition.stages?.get?.(stage) ??
                  definition.stages?.[stage]

        if (!stageDef) {
            return empty()
        }

        const validItemGrants = stageDef.grants.items.filter(grant =>
            checkRequirements({
                actor,
                stageDef,
                grantUuid: grant.uuid
            })
        )

        if (!validItemGrants.length && !stageDef.grants?.actor?.creatureSubType) return null

        return {
            items: normalizeItems(validItemGrants),
            creatureSubType: stageDef.grants?.actor?.creatureSubType ?? null
        }
    }

    function normalizeItems(items = [])
    {
        logger.debug("createStageGrantResolver.normalizeItems", {items})
        if (!Array.isArray(items)) return []

        return items.map(item => ({
            uuid: item.uuid,
            requiresUuids: normalizeRequiredItems(item.requires?.items),
            replacesUuid: normalizeUuidReference(item.replaces),
            overrides: item.overrides ?? null,
            postCreateScript: item.postCreateScript ?? null
        }))
    }

    function empty()
    {
        logger.debug("createStageGrantResolver.empty", {})
        return {
            items: [],
            creatureSubType: null
        }
    }

    return Object.freeze({
        resolve
    })

    function checkRequirements({
        actor,
        stageDef,
        grantUuid
    })
    {
        logger.debug("createStageChoiceResolver.isChoiceRuntimeValid", {
            actor,
            stageDef,
            grantUuid
        })
        const grantsDef = stageDef?.grants?.items?.find(c => c.uuid === grantUuid)

        if (!grantsDef) return false

        const requiredItems = normalizeRequiredItems(grantsDef.requires?.items)

        if (requiredItems.length) {
            const actorHasItems = requiresService.actorHasItems({
                actor,
                items: requiredItems
            })
            if (!actorHasItems) return false
        }

        return true
    }

    function normalizeRequiredItems(items)
    {
        if (!items) return []
        return Array.isArray(items) ? items : [items]
    }

    function normalizeUuidReference(reference)
    {
        if (!reference) return null

        if (typeof reference === "string")
            return reference

        return reference.uuid ?? null
    }
}
