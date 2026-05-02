import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ConsupmtionTargetDTOValidator } from "./ConsumptionTargetDTOValidator.js"
import { resolve } from "../rules/RuleBuilder.js"

// @ts-check
export class ConsumptionDTOValidator extends BaseDTOValidator
{
    static rules = {
        numberOfTargets: resolve(ctx =>
            Array.isArray(ctx.consumption?.targets)
                ? ctx.consumption.targets.length
                : 0
        ).equals()
    }

    validate(dtoOrConsumption, dtoOrContext = null)
    {
        const isNestedContext =
            dtoOrContext != null &&
            typeof dtoOrContext === "object" &&
            (
                "activity" in dtoOrContext ||
                "consumption" in dtoOrContext
            )

        const dto = isNestedContext ? dtoOrConsumption : dtoOrContext
        const consumption = isNestedContext
            ? (
                dtoOrContext.consumption ??
                dtoOrContext.activity?.consumption ??
                null
            )
            : dtoOrConsumption

        if (!consumption) {
            if (!dto.targets?.length)
                return true

            throw new Error(`[${this.path}] Missing consumption`)
        }

        super.validate(this.buildValidationDTO(dto), { consumption })
        this.validateTargets(consumption, dto.targets)

        return true
    }

    validateTargets(consumption, targets)
    {
        if (!targets?.length) return

        const consumptionTargets = consumption.targets ?? []

        targets.forEach((targetDTO, index) =>
        {
            const target = consumptionTargets[index]

            this.assert.isOk(
                target,
                `[${this.path}.targets[${index}]] Consumption target not found`
            )

            new ConsupmtionTargetDTOValidator({
                assert: this.assert,
                path: `${this.path}.targets[${index}]`,
                strict: this.strict
            }).validate(target, targetDTO)
        })
    }
}
