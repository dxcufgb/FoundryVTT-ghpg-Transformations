import { ConsumptionTargetValidationDTO } from "../consumptionTarget/ConsumptionTargetValidationDTO.js"

// @ts-check
export class ConsumptionValidationDTO
{
    static validator = null

    constructor ()
    {
        this.targets = []
    }

    addTarget(configure)
    {
        const dto = new ConsumptionTargetValidationDTO()
        configure(dto)
        this.targets.push(dto)
        return this
    }
}
