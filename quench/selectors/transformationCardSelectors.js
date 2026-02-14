import { generalSelector } from "./general.selectors.js"

export const TransformationCardSelectors = {
    ...generalSelector,
    transformationType: '#transformation-type',
    transformationStage: '#transformation-stage'
}
