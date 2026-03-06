export class ConsumptionTargetDTOValidator
{
    constructor ({ assert })
    {
        this.assert = assert
    }

    validate(dto)
    {
        const target = dto.consumptionTarget

        this.validateType(target, dto.type)
        this.validateValue(target, dto.value)
    }

    validateType(target, expectedType)
    {
        if (expectedType !== null) {
            this.assert.equal(
                target.type,
                expectedType,
                `Actual type of consumption target (${target.type}) did not match expected (${expectedType})`
            )
        }
    }

    validateValue(target, expectedValue)
    {
        if (expectedValue !== null) {
            this.assert.equal(
                target.value,
                expectedValue,
                `Actual value of consumption target (${target.value}) did not match expected (${expectedValue})`
            )
        }
    }
}