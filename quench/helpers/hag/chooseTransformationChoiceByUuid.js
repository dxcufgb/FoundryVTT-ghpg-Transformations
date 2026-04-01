import { findChoiceDialogRadioByUuid, findChoiceFooterButton } from "../../selectors/choiceDialog.finders.js"
import { expectAsyncWork } from "../async/expectAsyncWork.js"

export async function chooseTransformationChoiceByUuid({
    runtime,
    actor,
    stage,
    choiceUuid,
    waiters
})
{
    const dialog = await waitForChoiceDialogWithUuid({
        choiceUuid,
        waiters
    })

    if (!dialog) {
        throw new Error(
            `Transformation choice dialog for ${choiceUuid} was not found`
        )
    }

    const radio = await findChoiceDialogRadioByUuid(dialog, choiceUuid)

    if (!radio) {
        throw new Error(
            `Transformation choice ${choiceUuid} was not found in stage ${stage} dialog`
        )
    }

    radio.click()
    await waiters.waitForNextFrame()

    const confirmButton = await findChoiceFooterButton(dialog)

    if (!confirmButton) {
        throw new Error(`Transformation choice confirm button was not found for stage ${stage}`)
    }

    await expectAsyncWork(
        () => confirmButton.click(),
        { trackers: runtime.dependencies.utils.asyncTrackers }
    )

    await waiters.waitForNextFrame()
    await waiters.waitForElementGone(() =>
        document.body.contains(dialog) === false
    )
    await runtime.dependencies.utils.asyncTrackers.whenIdle()
    await waiters.waitForNextFrame()
}

async function waitForChoiceDialogWithUuid({
    choiceUuid,
    waiters
})
{
    let dialog = null

    await waiters.waitForCondition(() =>
    {
        dialog = Array.from(
            document.querySelectorAll(".transformation-choice-dialog")
        ).find(candidate =>
            candidate.querySelector(
                `input[type='radio'][name='choice'][data-uuid="${choiceUuid}"]`
            )
        ) ?? null

        return dialog != null
    })

    return dialog
}
