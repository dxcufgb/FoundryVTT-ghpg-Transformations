import { generalSelector } from "./general.selectors.js"
export const TransformationConfigSelectors = {
    ...generalSelector,
    dialog: "#transformation-config-",
    transformationRadio: 'input[name="transformation"]',
    close: 'button[data-action="close"]',
    configSection: ".transformation-config",
    footerSection: ".sheet-footer",
    submit: 'button[data-action="save"]'
}
