import { SpellSlotRecoveryViewModelHelper } from "./SpellSlotRecoveryViewModelHelper.js"

export function createFiendUnbridledPowerSpellSlotRecoveryViewModel({
    actor,
    amount,
    logger = null
})
{
    logger?.debug?.("createFiendUnbridledPowerSpellSlotRecoveryViewModel", {
        actor,
        amount
    })

    const spellSlotEntries = getRecoverableSpellSlotEntries(actor)
    const groups = Array.from(groupSpellSlotsByLevel(spellSlotEntries).values())

    return {
        amount,
        groups,
        hasRecoverableSlots: groups.length > 0
    }
}

function getRecoverableSpellSlotEntries(actor)
{
    const spells = actor?.system?.spells ?? {}
    const spellSlotEntries = []

    for (let level = 1; level <= 9; level += 1) {
        SpellSlotRecoveryViewModelHelper.appendRecoverableSpellEntriesForLevel({
            spellSlotEntries,
            spells,
            level
        })
    }

    const pactSlot = spells?.pact
    const pactLevel = Math.max(Number(pactSlot?.level ?? 0), 0)
    const pactCapacity = SpellSlotRecoveryViewModelHelper.getSpellSlotCapacity(pactSlot)
    const pactCurrentValue = Math.max(Number(pactSlot?.value ?? 0), 0)
    const pactMissing = Math.max(pactCapacity - pactCurrentValue, 0)

    for (let index = 0; index < pactMissing; index += 1) {
        spellSlotEntries.push({
            id: `pact-${index + 1}`,
            slotKey: "pact",
            level: pactLevel,
            cost: pactLevel,
            slotType: "pact",
            label: `Pact slot ${index + 1}`,
            groupLabel: `Pact Slots (Level ${pactLevel})`
        })
    }

    return spellSlotEntries
}

function groupSpellSlotsByLevel(spellSlotEntries)
{
    return spellSlotEntries.reduce((groups, entry) =>
    {
        const groupKey = String(entry.level)

        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                key: groupKey,
                label: `Level ${entry.level}`,
                level: entry.level,
                options: []
            })
        }

        groups.get(groupKey).options.push({
            id: entry.id,
            slotKey: entry.slotKey,
            level: entry.level,
            cost: entry.cost,
            slotType: entry.slotType,
            label: entry.label
        })

        return groups
    }, new Map())
}
