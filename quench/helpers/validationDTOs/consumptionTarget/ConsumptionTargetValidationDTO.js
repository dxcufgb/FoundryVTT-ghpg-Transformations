// @ts-check
export class ConsumptionTargetValidationDTO
{
    // @ts-ignore
    constructor (consumptionTarget)
    {
        this.consumptionTarget = consumptionTarget

        this.type = null    // string
        this.value = null   // number | string
    }
}
