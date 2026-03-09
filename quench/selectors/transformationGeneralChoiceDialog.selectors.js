import { generalSelector } from "./general.selectors.js"
export const TransformationGeneralDialogSelectors = {
    ...generalSelector,
    dialog: "#transformation-general-choice-",
    choiceButtonById: `button[data-choice-id="{choice.id}"]`,
    description: ".transformation-general-description",
    choiceButton: 'input[name="transformation-general"]'
}
