import { waitForElement } from "../helpers/dom.js"
import { TransformationCardSelectors } from "./transformationCardSelectors.js"
import { TransformationConfigSelectors } from "./transformationConfig.selectors.js"

export function findTransformationTypeSelect(card, options = {})
{
    return waitForElement({
        root: card,
        selector: TransformationCardSelectors.transformationType,
        ...options
    })
}

export function findTransformationStageSelect(card, options = {})
{
    return waitForElement({
        root: card,
        selector: TransformationCardSelectors.transformationStage,
        ...options
    })
}