import { generalSelector } from "./general.selectors.js"

export const choiceDialogSelectors = {
    ...generalSelector,
    dialogId: "#transformation-choice-dialog-{actorId}-stage-{stage}",
    choicesRadios: "input[type='radio'][name='choice']",
    choiceRadioByUuid: `input[data-uuid="{choice.uuid}"]`,
    confirmButton: ".choice-confirm",
    choiceDescriptionContainer: ".choice-description-container",
    choiceFooter: ".choice-footer",
    activeChoiceDescription: ":not([hidden])"
}