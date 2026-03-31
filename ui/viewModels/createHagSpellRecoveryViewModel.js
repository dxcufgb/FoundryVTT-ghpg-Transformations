export function createHagSpellRecoveryViewModel({
    actor,
    logger = null
})
{
    logger?.debug?.("createHagSpellRecoveryViewModel", {
        actor
    })

    const availableHitDice = getAvailableHitDice(actor)
    const characterLevel = getCharacterLevel(actor)
    const maxRecoverableLevel =
        characterLevel > 0
            ? Math.ceil(characterLevel / 3)
            : 0

    const spellSlotEntries = getRecoverableSpellSlotEntries(actor, {
        availableHitDice,
        maxRecoverableLevel
    })
    const groups = Array.from(groupSpellSlotsByLevel(spellSlotEntries).values())

    return {
        availableHitDice,
        characterLevel,
        maxRecoverableLevel,
        groups,
        hasRecoverableSlots: groups.length > 0
    }
}

function getRecoverableSpellSlotEntries(actor, {
    availableHitDice,
    maxRecoverableLevel
})
{
    if (availableHitDice <= 0 || maxRecoverableLevel <= 0) {
        return []
    }

    const spells = actor?.system?.spells ?? {}
    const spellSlotEntries = []
    const highestRecoverableLevel = Math.min(
        9,
        maxRecoverableLevel,
        availableHitDice
    )

    for (let level = 1; level <= highestRecoverableLevel; level += 1) {
        const slotKey = `spell${level}`
        const slot = spells?.[slotKey]
        const capacity = getSpellSlotCapacity(slot)
        const currentValue = Math.max(Number(slot?.value ?? 0), 0)
        const missing = Math.max(capacity - currentValue, 0)

        for (let index = 0; index < missing; index += 1) {
            spellSlotEntries.push({
                id: `${slotKey}-${index + 1}`,
                slotKey,
                level,
                cost: level,
                slotType: "spell",
                label: `Level ${level} slot ${index + 1}`,
                groupLabel: `Level ${level}`
            })
        }
    }

    const pactSlot = spells?.pact
    const pactLevel = Math.max(Number(pactSlot?.level ?? 0), 0)
    const pactCapacity = getSpellSlotCapacity(pactSlot)
    const pactCurrentValue = Math.max(Number(pactSlot?.value ?? 0), 0)
    const pactMissing = Math.max(pactCapacity - pactCurrentValue, 0)

    if (
        pactLevel > 0 &&
        pactLevel <= highestRecoverableLevel
    ) {
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
                label: entry.groupLabel ?? `Level ${entry.level}`,
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

function getAvailableHitDice(actor)
{
    const classItems = actor?.items?.filter(item => item.type === "class") ?? []

    return classItems.reduce((total, item) =>
        total + Math.max(Number(item.system?.hd?.value ?? 0), 0),
    0)
}

function getCharacterLevel(actor)
{
    const classItems = actor?.items?.filter(item => item.type === "class") ?? []
    const classLevelTotal = classItems.reduce((total, item) =>
        total + Math.max(Number(item.system?.levels ?? 0), 0),
    0)

    if (classLevelTotal > 0) return classLevelTotal

    const detailsLevel = Number(actor?.system?.details?.level ?? 0)
    return Number.isFinite(detailsLevel) ? Math.max(detailsLevel, 0) : 0
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
