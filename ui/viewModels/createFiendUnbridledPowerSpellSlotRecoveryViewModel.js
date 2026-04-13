import { createTransformationsSpellSlotRecoveryViewModel } from "./createTransformationsSpellSlotRecoveryViewModel.js"

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

    const normalizedAmount = Math.max(Number(amount ?? 0), 0)

    return createTransformationsSpellSlotRecoveryViewModel({
        actor,
        title: "Recover Spell Slots",
        description:
            "Select expended spell slots to restore. The total level of the slots you pick cannot exceed your available recovery pool.",
        confirmLabel: "Restore",
        emptyMessage: "No spent spell slots can be recovered.",
        selectionMode: "multiple",
        maxRecoverableLevel: 9,
        maxRecoverableCost: normalizedAmount,
        useEntryGroupLabel: false,
        summaryStats: [
            {
                label: "Recovery Pool",
                value: normalizedAmount
            }
        ],
        selectionSummary: {
            label: "Remaining",
            initialValue: normalizedAmount
        },
        classPrefix: "fiend-unbridled-power-spell-slot-recovery",
        dialogClassName: "fiend-unbridled-power-spell-slot-recovery-dialog",
        extraContext: {
            amount: normalizedAmount
        },
        logger
    })
}
