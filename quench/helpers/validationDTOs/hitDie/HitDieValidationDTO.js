import { HitDieDTOValidator } from "../../DTOValidators/HitDieDTOValidator.js"

// @ts-check
export class HitDieValidationDTO
{
    static validator = HitDieDTOValidator

    constructor (
        classes = null,
        sizes = null,
        max = null,
        value = null,
        largest = null,
        largestAvailable = null,
        smallest = null,
        smallestAvailable = null
    )
    {
        this.classes = classes
        this.sizes = sizes
        this.max = max
        this.value = value
        this.largest = largest
        this.largestAvailable = largestAvailable
        this.smallest = smallest
        this.smallestAvailable = smallestAvailable
    }
}
