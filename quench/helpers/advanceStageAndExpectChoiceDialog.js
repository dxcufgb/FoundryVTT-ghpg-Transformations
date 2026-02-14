import { findChoiceDialogById } from "../selectors/choiceDialog.finders.js"
import { waitForElement, waitForNextFrame } from "./dom.js"

/**
 * Advances the actor to a stage and asserts that the
 * TransformationChoiceDialog opens.
 */
export async function advanceStageAndExpectChoiceDialog({
    actor,
    stage,
    asyncTrackers,
    errorMessage
})
{
    // --- act: advance stage -----------------------------------------------
    await actor.update({
        "flags.transformations.stage": stage
    })

    // --- wait: async fallout ----------------------------------------------
    await asyncTrackers.whenIdle()

    // --- wait: Foundry v13 render pipeline ---------------------------------
    const dialog = await findChoiceDialogById(actor, stage)

    if (!dialog) {
        throw new Error(
            errorMessage ??
            `Expected choice dialog for stage ${stage}, but none was rendered`
        )
    }

    return dialog
}
