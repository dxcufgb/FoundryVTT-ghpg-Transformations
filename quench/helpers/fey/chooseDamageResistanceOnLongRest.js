import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog } from "../../selectors/transformationGeneralChoiceDialog.finders.js"

export async function chooseDamageResistanceOnLongRest({
    runtime,
    actor,
    choice,
    waiters
})
{
    const longRestPromise = runtime.services.triggerRuntime.run("longRest", actor)

    const dialog = await findTransformationGeneralChoiceDialog(actor)
    const button = await findTransformationGeneralChoiceButtonById(dialog, choice)

    button.click()
    await waiters.waitForNextFrame()

    // 4️⃣ Wait for dialog to close
    await waiters.waitForElementGone(() =>
        document.body.contains(dialog) === false
    )
    await longRestPromise

    await runtime.dependencies.utils.asyncTrackers.whenIdle()
    await waiters.waitForNextFrame()
}