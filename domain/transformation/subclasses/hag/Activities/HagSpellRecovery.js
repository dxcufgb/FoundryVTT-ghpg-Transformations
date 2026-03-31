export async function hagSpellRecovery({
    actor,
    actorRepository,
    dialogFactory
})
{
    if (!actor || !actorRepository || !dialogFactory?.openHagSpellRecovery) {
        return false
    }

    const selectedSpellSlot = await dialogFactory.openHagSpellRecovery({
        actor
    })

    if (!selectedSpellSlot?.slotKey || Number(selectedSpellSlot.level) <= 0) {
        return false
    }

    const restored = await restoreSpellSlot(actor, selectedSpellSlot)
    if (!restored) return false

    await actorRepository.consumeHitDie(
        actor,
        Number(selectedSpellSlot.cost ?? selectedSpellSlot.level)
    )

    return true
}

export async function restoreSpellSlot(actor, selectedSpellSlot)
{
    const slotKey = selectedSpellSlot?.slotKey
    if (!actor || !slotKey) return false

    const slot = actor.system?.spells?.[slotKey]
    const currentValue = Math.max(Number(slot?.value ?? 0), 0)
    const maxValue = getSpellSlotCapacity(slot)

    if (maxValue <= currentValue) return false

    await actor.update({
        [`system.spells.${slotKey}.value`]: Math.min(currentValue + 1, maxValue)
    })

    return true
}

function getSpellSlotCapacity(slot)
{
    if (!slot) return 0

    const rawOverride = slot.override
    if (rawOverride !== null && rawOverride !== undefined && rawOverride !== "") {
        const overrideValue = Number(rawOverride)
        return Number.isFinite(overrideValue)
            ? Math.max(overrideValue, 0)
            : 0
    }

    const maxValue = Number(slot.max ?? 0)
    return Number.isFinite(maxValue) ? Math.max(maxValue, 0) : 0
}
