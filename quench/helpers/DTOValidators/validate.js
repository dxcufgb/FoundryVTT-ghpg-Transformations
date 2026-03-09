// @ts-check

// @ts-ignore
export function validate(dto, { assert, path = null, strict = true } = {})
{
    if (!dto)
        throw new Error("validate() called with empty DTO")

    const ValidatorClass = dto.constructor?.validator

    if (!ValidatorClass) {
        throw new Error(
            `DTO "${dto.constructor?.name}" does not declare a static validator`
        )
    }

    const validator = new ValidatorClass({
        assert,
        path: path ?? dto.constructor.name.replace("ValidationDTO", "").toLowerCase(),
        strict
    })

    return validator.validate(dto)
}