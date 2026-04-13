import { SpellSlotRecoveryViewModelHelper } from "./SpellSlotRecoveryViewModelHelper.js"
import { createTransformationsSpellSlotRecoveryViewModel } from "./createTransformationsSpellSlotRecoveryViewModel.js"

export function createHagSpellRecoveryViewModel({
    actor,
    logger = null
})
{
    logger?.debug?.("createHagSpellRecoveryViewModel", {
        actor
    })

    const availableHitDice = SpellSlotRecoveryViewModelHelper.getAvailableHitDice(actor)
    const characterLevel = SpellSlotRecoveryViewModelHelper.getCharacterLevel(actor)
    const maxRecoverableLevel =
        characterLevel > 0
            ? Math.ceil(characterLevel / 3)
            : 0

    return createTransformationsSpellSlotRecoveryViewModel({
        actor,
        title: "Hag Spell Recovery",
        description:
            "Recover one expended spell slot by spending Hit Point Dice equal to the slot's level. " +
            "You can recover a spell slot of a level no higher than one third of your character level, rounded up.",
        confirmLabel: "Restore",
        emptyMessage: "No eligible expended spell slots can be recovered.",
        selectionMode: "single",
        maxRecoverableLevel,
        maxRecoverableCost: availableHitDice,
        summaryStats: [
            {
                label: "Hit Dice Available",
                value: availableHitDice
            },
            {
                label: "Character Level",
                value: characterLevel
            },
            {
                label: "Max Slot Level",
                value: maxRecoverableLevel
            }
        ],
        selectionSummary: {
            label: "Selected Cost",
            initialValue: 0
        },
        classPrefix: "hag-spell-recovery",
        dialogClassName: "hag-spell-recovery-dialog",
        inputName: "hag-spell-recovery-choice",
        extraContext: {
            availableHitDice,
            characterLevel,
            maxRecoverableLevel
        },
        logger
    })
}
