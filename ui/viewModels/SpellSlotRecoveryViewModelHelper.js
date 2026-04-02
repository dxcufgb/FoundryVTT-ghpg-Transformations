export class SpellSlotRecoveryViewModelHelper
{
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
