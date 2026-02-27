import { waitForElement } from "../helpers/dom.js"
import { TransformationGeneralDialogSelectors } from "./transformationGeneralChoiceDialog.selectors.js"


export function findTransformationGeneralChoiceDialog(actor, options = {})
{
    const formId = TransformationGeneralDialogSelectors.dialog + actor.id
    return waitForElement({
        root: document,
        selector: formId,
        ...options
    })
}

export function queryTransformationGeneralChoiceDialog()
{
    return document.querySelector(TransformationGeneralDialogSelectors.dialog)
}

export async function findTransformationGeneralChoiceButtonById(dialog, id)
{
    const selector = TransformationGeneralDialogSelectors.choiceButtonById.replace("{choice.id}", id)
    return dialog.querySelector(selector)
}

export function getTransformationGeneralChoiceDialogWindowTitle(dialog)
{
    return dialog.querySelector(TransformationGeneralDialogSelectors.windowTitle)
}