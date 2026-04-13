import { SpellSlotRecoveryViewModelHelper } from "./SpellSlotRecoveryViewModelHelper.js"

export function createTransformationsSpellSlotRecoveryViewModel({
    actor,
    title = "Recover Spell Slots",
    description = null,
    confirmLabel = "Restore",
    cancelLabel = "Cancel",
    emptyMessage = "No spent spell slots can be recovered.",
    selectionMode = "single",
    maxRecoverableLevel = 9,
    maxRecoverableCost = Number.POSITIVE_INFINITY,
    useEntryGroupLabel = true,
    summaryStats = [],
    selectionSummary = null,
    classPrefix = "transformations-spell-slot-recovery",
    dialogClassName = "transformations-spell-slot-recovery-dialog",
    inputName = "transformations-spell-slot-recovery-choice",
    extraContext = {},
    logger = null
})
{
    logger?.debug?.("createTransformationsSpellSlotRecoveryViewModel", {
        actor,
        title,
        selectionMode,
        maxRecoverableLevel,
        maxRecoverableCost
    })

    const spellSlotEntries = SpellSlotRecoveryViewModelHelper.createRecoverableSpellSlotEntries(
        actor,
        {
            maxRecoverableLevel,
            maxRecoverableCost
        }
    )
    const groups = Array.from(
        SpellSlotRecoveryViewModelHelper.groupSpellSlotsByLevel(
            spellSlotEntries,
            {
                useEntryGroupLabel
            }
        ).values()
    )

    return {
        title,
        description,
        confirmLabel,
        cancelLabel,
        emptyMessage,
        selectionMode,
        isMultipleSelection: selectionMode === "multiple",
        isSingleSelection: selectionMode !== "multiple",
        maxRecoverableCost,
        inputType: selectionMode === "multiple" ? "checkbox" : "radio",
        inputName: selectionMode === "single" ? inputName : null,
        summaryStats,
        selectionSummary,
        classPrefix,
        dialogClassName,
        groups,
        hasRecoverableSlots: groups.length > 0,
        ...extraContext
    }
}
