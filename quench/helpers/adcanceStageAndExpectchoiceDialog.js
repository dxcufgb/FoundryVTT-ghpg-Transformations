import {
    findChoiceDialogById,
    findChoiceDialogRadioByUuid,
    findChoiceFooterButton,
    getChoiceDialogById
} from "../selectors/choiceDialog.finders.js"
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
    const expectedChoiceSelection = Array.isArray(choiceUuid)
        ? choiceUuid
        : [choiceUuid]

    await actor.update({
        "flags.transformations.stage": stage
    })

    await asyncTrackers.whenIdle()
    await waitForNextFrame()

    let dialog = getChoiceDialogById(actor, stage)

    if (!dialog) {
        try {
            dialog = await findChoiceDialogById(actor, stage, {
                timeout: 250
            })
        } catch (error) {
            dialog = null
        }
    }

    if (dialog) {
        for (const selectedChoiceUuid of expectedChoiceSelection) {
            const choiceInput = await findChoiceDialogRadioByUuid(
                dialog,
                selectedChoiceUuid
            )

            if (!choiceInput) {
                throw new Error(
                    `Choice input with uuid ${selectedChoiceUuid} not found in stage ${stage} dialog`
                )
            }

            choiceInput.click()
            await waitForNextFrame()
        }

        const confirmButton = await findChoiceFooterButton(dialog)

        if (!confirmButton) {
            throw new Error(`Confirm button not found in stage ${stage} dialog`)
        }

        await expectAsyncWork(
            () => confirmButton.click(),
            { trackers: asyncTrackers }
        )
        await waitForNextFrame()

        await waitForElementGone(() =>
            document.body.contains(dialog) === false
        )
    }

    await asyncTrackers.whenIdle()
    await waitForNextFrame()

    await waitForCondition(() =>
    {
        const storedChoiceSelection = actor.getFlag(
            "transformations",
            "stageChoices"
        )?.[transformationId]?.[stage]

        if (Array.isArray(choiceUuid)) {
            return Array.isArray(storedChoiceSelection) &&
                storedChoiceSelection.length === expectedChoiceSelection.length &&
                expectedChoiceSelection.every(selectedChoiceUuid =>
                    storedChoiceSelection.includes(selectedChoiceUuid)
                )
        }

        return storedChoiceSelection === choiceUuid ||
            (
                Array.isArray(storedChoiceSelection) &&
                storedChoiceSelection.includes(choiceUuid)
            )
    })

    const storedChoiceSelection = actor.getFlag(
        "transformations",
        "stageChoices"
    )?.[transformationId]?.[stage]

    if (Array.isArray(choiceUuid)) {
        return storedChoiceSelection
    }

    if (Array.isArray(storedChoiceSelection)) {
        return storedChoiceSelection.includes(choiceUuid)
            ? choiceUuid
            : storedChoiceSelection[0]
    }

    return storedChoiceSelection
}
