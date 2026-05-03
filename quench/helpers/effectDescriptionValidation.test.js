import { EffectDTOValidator } from "./DTOValidators/EffectDTOValidator.js"
import { EffectValidationDTO } from "./validationDTOs/effect/EffectValidationDTO.js"

quench.registerBatch(
    "transformations.helpers.effectDescriptionValidation",
    ({describe, it, expect, assert}) =>
    {
        describe("Effect description validation", function ()
        {
            it("normalizes leading and trailing whitespace when comparing effect descriptions", function ()
            {
                const expectedDescription =
                    "The creature takes a \u20132 penalty on all saving throws."
                const dto = new EffectValidationDTO()
                dto.description = expectedDescription
                const validator = new EffectDTOValidator({
                    assert,
                    path: "effect"
                })

                expect(() => validator.validate(
                    {
                        description: `\n ${expectedDescription}`
                    },
                    dto
                ))
                    .not
                    .to
                    .throw()
            })

            it("still fails when the normalized description text is different", function ()
            {
                const expectedDescription =
                    "The creature takes a \u20132 penalty on all saving throws."
                const dto = new EffectValidationDTO()
                dto.description = expectedDescription
                const validator = new EffectDTOValidator({
                    assert,
                    path: "effect"
                })

                expect(() => validator.validate(
                    {
                        description: "The creature gains advantage on saving throws."
                    },
                    dto
                ))
                    .to
                    .throw(/Expected The creature takes a \u20132 penalty on all saving throws\./u)
            })
        })
    }
)
