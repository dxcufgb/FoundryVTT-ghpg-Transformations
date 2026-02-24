export function createConditionService({
    logger
})
{
    logger.debug("createConditionService", {})

    function hasSpellSlotCapacity(actor)
    {
        logger.debug("createConditionService.hasSpellSlotCapacity", { actor })
        const spells = actor?.system?.spells
        if (!spells) return false

        return Object.values(spells).some(slot =>
            typeof slot?.max === "number" && slot.max > 0
        )
    }

    function hasAvailableSpellSlots(actor)
    {
        logger.debug("createConditionService.hasAvailableSpellSlots", { actor })
        const spells = actor?.system?.spells
        if (!spells) return false

        return Object.values(spells).some(slot =>
            typeof slot?.value === "number" && slot.value > 0
        )
    }

    function checkActorRequirement({ actor, requirement })
    {
        logger.debug("createConditionService.checkActorRequirement", { actor, requirement })
        if (!requirement) return true

        switch (requirement) {

            case "HAS_SPELL_SLOTS":
                return hasSpellSlotCapacity(actor)

            case "HAS_AVAILABLE_SPELL_SLOTS":
                return hasAvailableSpellSlots(actor)

            default:
                console.warn(
                    `[ConditionService] Unknown actor requirement: ${requirement}`
                )
                return false
        }
    }

    return Object.freeze({
        checkActorRequirement,
        hasSpellSlotCapacity,
        hasAvailableSpellSlots
    })
}
