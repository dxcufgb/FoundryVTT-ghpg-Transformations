import { waitForElement } from "../helpers/dom.js"
import { choiceDialogSelectors } from "./choiceDialog.selectors.js"

export async function findChoiceDialogById(actor, stage, options = {})
{
    const formId = choiceDialogSelectors.dialogId.replace("{actorId}", actor.id).replace("{stage}", stage)
    return waitForElement({
        root: document,
        selector: formId,
        ...options
    })
}

export function getChoiceDialogById(actor, stage, options = {})
{
    const formId = choiceDialogSelectors.dialogId.replace("{actorId}", actor.id).replace("{stage}", stage)
    return document.querySelector(formId)
}

export async function findChoiceDialogRadioButtons(dialog)
{
    return dialog.querySelectorAll(choiceDialogSelectors.choicesRadios)
}

export async function findChoiceDialogRadioByUuid(dialog, uuid)
{
    const selector = choiceDialogSelectors.choiceRadioByUuid.replace("{choice.uuid}", uuid)
    return dialog.querySelector(selector)
}

export async function findChoiceDialogDescriptionContainer(dialog)
{
    return dialog.querySelector(choiceDialogSelectors.choiceDescriptionContainer)
}

export async function findChoiceDialogFooter(dialog)
{
    return dialog.querySelector(choiceDialogSelectors.choiceFooter)
}

export async function findActiveChoiceDescription(descriptionDiv)
{
    return descriptionDiv.querySelector(choiceDialogSelectors.activeChoiceDescription)
}

export async function findChoiceFooterButton(footer)
{
    return footer.querySelector(choiceDialogSelectors.confirmButton)
}