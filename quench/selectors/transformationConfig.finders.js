import { waitForElement } from "../helpers/dom.js"
import { TransformationConfigSelectors } from "./transformationConfig.selectors.js"

export function findTransformationConfigDialog(actor, options = {})
{
    const formId = TransformationConfigSelectors.dialog + actor.id
    return waitForElement({
        root: document,
        selector: formId,
        ...options
    })
}

export function queryTransformationConfigDialog()
{
    return document.querySelector(TransformationConfigSelectors.dialog)
}

export function getTransformationConfigDialogRadioInput(dialog, { checked = false } = {})
{
    const baseSelector = TransformationConfigSelectors.transformationRadio
    const selector = checked ? `${baseSelector}:checked` : baseSelector
    return dialog.querySelector(selector)
}

export function getTransformationConfigDialogRadioInputs(dialog, { checked = false } = {})
{
    const baseSelector = TransformationConfigSelectors.transformationRadio
    const selector = checked ? `${baseSelector}:checked` : baseSelector
    return dialog.querySelectorAll(selector)
}

export function getTransformationConfigDialogCloseButton(dialog)
{
    return dialog.querySelector(TransformationConfigSelectors.close)
}

export function getTransformationConfigDialogWindowTitle(dialog)
{
    return dialog.querySelector(TransformationConfigSelectors.windowTitle)
}

export function getTransformationConfigDialogConfigSection(dialog)
{
    return dialog.querySelector(TransformationConfigSelectors.configSection)
}
export function getTransformationConfigDialogFooterSection(dialog)
{
    return dialog.querySelector(TransformationConfigSelectors.footerSection)
}

export function getTransformationConfigDialogSubmit(dialog)
{
    return dialog.querySelector(TransformationConfigSelectors.submit)
}