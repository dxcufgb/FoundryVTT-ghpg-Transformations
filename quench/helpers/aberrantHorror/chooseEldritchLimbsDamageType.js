import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog } from "../../selectors/transformationGeneralChoiceDialog.finders.js"
import { applyItemActivityEffect } from "../actors.js"

export async function chooseEldritchLimbsDamageType({
    runtime,
    actor,
    choice,
    waiters
})
{
    const activationPromise = applyItemActivityEffect({
        actor,
        itemName: "Aberrant Mutation",
        effectName: "Eldritch Limbs",
        macroTrigger: "on"
    })

    const dialog = await findTransformationGeneralChoiceDialog(actor)
    const button = await findTransformationGeneralChoiceButtonById(dialog, choice)

    button.click()
    await waiters.waitForNextFrame()

    await waiters.waitForElementGone(() =>
        document.body.contains(dialog) === false
    )
    await activationPromise

    await runtime.dependencies.utils.asyncTrackers.whenIdle()
    await waiters.waitForNextFrame()
}
