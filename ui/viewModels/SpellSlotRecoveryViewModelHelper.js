export class SpellSlotRecoveryViewModelHelper
{
    static createRecoverableSpellSlotEntries(actor, {
        maxRecoverableLevel = 9,
        maxRecoverableCost = Number.POSITIVE_INFINITY
    } = {})
    {
        const normalizedMaxRecoverableLevel = Math.max(
            Number(maxRecoverableLevel ?? 0),
            0
        )
        const normalizedMaxRecoverableCost = Number.isFinite(
            Number(maxRecoverableCost)
        )
            ? Math.max(Number(maxRecoverableCost), 0)
            : Number.POSITIVE_INFINITY

        if (
            normalizedMaxRecoverableLevel <= 0 ||
            normalizedMaxRecoverableCost <= 0
        ) {
            return []
        }

        const spells = actor?.system?.spells ?? {}
        const spellSlotEntries = []
        const highestRecoverableLevel = Math.min(
            9,
            normalizedMaxRecoverableLevel,
            normalizedMaxRecoverableCost
        )

        for (let level = 1; level <= highestRecoverableLevel; level += 1) {
            this.appendRecoverableSpellEntriesForLevel({
                spellSlotEntries,
                spells,
                level
            })
        }

        const pactSlot = spells?.pact
        const pactLevel = Math.max(Number(pactSlot?.level ?? 0), 0)
        const pactCapacity = this.getSpellSlotCapacity(pactSlot)
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

    static groupSpellSlotsByLevel(spellSlotEntries, {
        useEntryGroupLabel = true
    } = {})
    {
        return spellSlotEntries.reduce((groups, entry) =>
        {
            const groupKey = String(entry.level)

            if (!groups.has(groupKey)) {
                groups.set(groupKey, {
                    key: groupKey,
                    label:
                        useEntryGroupLabel
                            ? (entry.groupLabel ?? `Level ${entry.level}`)
                            : `Level ${entry.level}`,
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

    static getAvailableHitDice(actor)
    {
        const classItems = actor?.items?.filter(item => item.type === "class") ?? []

        return classItems.reduce((total, item) =>
            total + Math.max(Number(item.system?.hd?.value ?? 0), 0),
        0)
    }

    static getCharacterLevel(actor)
    {
        const classItems = actor?.items?.filter(item => item.type === "class") ?? []
        const classLevelTotal = classItems.reduce((total, item) =>
            total + Math.max(Number(item.system?.levels ?? 0), 0),
        0)

        if (classLevelTotal > 0) return classLevelTotal

        const detailsLevel = Number(actor?.system?.details?.level ?? 0)
        return Number.isFinite(detailsLevel) ? Math.max(detailsLevel, 0) : 0
    }

    static appendRecoverableSpellEntriesForLevel({
        spellSlotEntries,
        spells,
        level
    })
    {
        const slotKey = `spell${level}`
        const slot = spells?.[slotKey]
        const capacity = this.getSpellSlotCapacity(slot)
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

    static getSpellSlotCapacity(slot)
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
}
