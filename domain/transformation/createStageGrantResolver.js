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
        logger.debug("createStageGrantResolver.resolve", { definition, stage })
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
        logger.debug("createStageGrantResolver.normalizeItems", { items })
        if (!Array.isArray(items)) return []

        return items.map(item => ({
            uuid: item.uuid,
            replacesUuid: item.replaces?.uuid ?? null,
            overrides: item.overrides ?? null
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

        if (grantsDef.requires?.items?.length) {
            const actorHasItems = requiresService.actorHasItems({ actor, items: grantsDef.requires.items })
            if (!actorHasItems) return false
        }

        return true
    }
}
