import { findChoiceDialogRadioByUuid, findChoiceFooterButton } from "../selectors/choiceDialog.finders.js"
import { advanceStageAndExpectChoiceDialog } from "./advanceStageAndExpectChoiceDialog.js"
import { expectAsyncWork } from "./async/expectAsyncWork.js"
import { waitForElementGone, waitForNextFrame } from "./dom.js"
import { waitForCondition } from "./waitForCondition.js"

export async function advanceStageAndChoose({
    actor,
    stage,
    choiceUuid,
    asyncTrackers
})
{
    const transformationId = actor.getFlag("transformations", "type")
    // 1️⃣ Open dialog
    const dialog = await advanceStageAndExpectChoiceDialog({
        actor,
        stage,
        asyncTrackers
    })

    if (!dialog) {
        throw new Error(`Choice dialog for stage ${stage} did not open`)
    }

    // 2️⃣ Find radio
    const radio = await findChoiceDialogRadioByUuid(dialog, choiceUuid)

    if (!radio) {
        throw new Error(
            `Radio with uuid ${choiceUuid} not found in stage ${stage} dialog`
        )
    }

    // Use click instead of manual checked mutation
    radio.click()
    await waitForNextFrame()

    // 3️⃣ Confirm
    const confirmButton = await findChoiceFooterButton(dialog)

    if (!confirmButton) {
        throw new Error(`Confirm button not found in stage ${stage} dialog`)
    }

    await expectAsyncWork(
        () => confirmButton.click(),
        { trackers: asyncTrackers }
    )
    await waitForNextFrame()

    // 4️⃣ Wait for dialog to close
    await waitForElementGone(() =>
        document.body.contains(dialog) === false
    )

    await asyncTrackers.whenIdle()
    await waitForNextFrame()
    // 5️⃣ Return stored value
    await waitForCondition(() =>
        actor.getFlag("transformations", "stageChoices")
        ?.[transformationId]?.[stage] === choiceUuid
    )

    return actor.getFlag("transformations", "stageChoices")
        ?.[transformationId]?.[stage]
}