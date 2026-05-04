import { ActivityDTOValidator } from "./DTOValidators/ActivityDTOValidator.js"
import { EffectDTOValidator } from "./DTOValidators/EffectDTOValidator.js"
import { validate } from "./DTOValidators/validate.js"
import { ActivityValidationDTO } from "./validationDTOs/activity/ActivityValidationDTO.js"
import { ActorValidationDTO } from "./validationDTOs/actor/ActorValidationDTO.js"
import { EffectValidationDTO } from "./validationDTOs/effect/EffectValidationDTO.js"
import { SKILL } from "../../config/constants.js"

const ABILITY_KEYS = Object.freeze([
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
])

function createAbilityStub()
{
    return {
        value: 10,
        proficient: 0,
        max: 20,
        mod: 0,
        saveBonus: 0,
        checkBonus: 0,
        attack: 0,
        dc: 10,
        bonuses: {
            check: "",
            save: ""
        },
        check: {
            roll: {
                min: null,
                max: null,
                mode: 0,
                modeCounts: {
                    override: 0,
                    advantages: {
                        count: 0,
                        suppressed: 0
                    },
                    disadvantages: {
                        count: 0,
                        suppressed: 0
                    }
                }
            }
        },
        save: {
            value: 0,
            roll: {
                min: null,
                max: null,
                mode: 0,
                modeCounts: {
                    override: 0,
                    advantages: {
                        count: 0,
                        suppressed: 0
                    },
                    disadvantages: {
                        count: 0,
                        suppressed: 0
                    }
                }
            }
        },
        checkProf: {
            deterministic: false,
            _baseProficiency: 0,
            multiplier: 1,
            rounding: "floor"
        },
        saveProf: {
            deterministic: false,
            _baseProficiency: 0,
            multiplier: 1,
            rounding: "floor"
        }
    }
}

function createSkillStub()
{
    return {
        ability: "dex",
        value: 0,
        effectValue: 0,
        bonus: 0,
        mod: 0,
        proficient: 0,
        total: 0,
        passive: 10,
        roll: {
            min: null,
            max: null,
            mode: 0,
            modeCounts: {
                override: 0,
                advantages: {
                    count: 0,
                    suppressed: 0
                },
                disadvantages: {
                    count: 0,
                    suppressed: 0
                }
            }
        },
        bonuses: {
            check: "",
            passive: ""
        },
        prof: {
            deterministic: false,
            _baseProficiency: 0,
            multiplier: 1,
            rounding: "floor"
        }
    }
}

function createActorValidationStub()
{
    return {
        system: {
            abilities: Object.fromEntries(
                ABILITY_KEYS.map(key => [key, createAbilityStub()])
            ),
            skills: Object.fromEntries(
                Object.values(SKILL).map(key => [key, createSkillStub()])
            ),
            attributes: {
                ac: {
                    value: 10
                },
                exhaustion: 0,
                movement: {
                    bonus: 0
                },
                senses: {
                    darkvision: 0
                },
                death: {
                    success: 0,
                    failure: 0
                },
                hd: {}
            },
            traits: {
                dr: {
                    value: [],
                    bypasses: []
                },
                di: {
                    value: []
                },
                dv: {
                    value: []
                }
            },
            spells: {}
        },
        effects: {
            contents: [
                {
                    name: "General Effect"
                }
            ]
        },
        items: {
            contents: []
        },
        flags: {}
    }
}

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

            it("reads effect descriptions from system.description.value", function ()
            {
                const dto = new EffectValidationDTO()
                dto.description = "Stored in system description."
                const validator = new EffectDTOValidator({
                    assert,
                    path: "effect"
                })

                expect(() => validator.validate(
                    {
                        system: {
                            description: {
                                value: "\n<p>Stored in system description.</p>\n"
                            }
                        }
                    },
                    dto
                ))
                    .not
                    .to
                    .throw()
            })

            it("reads activity effect descriptions from wrapped activity effect contexts", function ()
            {
                const dto = new EffectValidationDTO()
                dto.description = "Wrapped activity effect."
                const validator = new EffectDTOValidator({
                    assert,
                    path: "effect"
                })

                expect(() => validator.validate(
                    {
                        effectType: "activity",
                        effectObject: {
                            effect: {
                                description: "\n<p>Wrapped activity effect.</p>\n"
                            }
                        }
                    },
                    dto
                ))
                    .not
                    .to
                    .throw()
            })

            it("compares plain-text expectations against html-backed effect descriptions", function ()
            {
                const dto = new EffectValidationDTO()
                dto.description = "The creature takes a –2 penalty on all saving throws."
                const validator = new EffectDTOValidator({
                    assert,
                    path: "effect"
                })

                expect(() => validator.validate(
                    {
                        description: "\n<p>The creature takes a –2 penalty on all saving throws.</p>\n"
                    },
                    dto
                ))
                    .not
                    .to
                    .throw()
            })

            it("normalizes activity effect descriptions when validated through ActivityDTOValidator", function ()
            {
                const dto = new ActivityValidationDTO()
                dto.addEffect(effect =>
                {
                    effect.name = "Daemonic Brand Saving Throw Penalty"
                    effect.description = "The creature takes a \u20132 penalty on all saving throws."
                })

                const validator = new ActivityDTOValidator({
                    assert,
                    path: "activity"
                })

                expect(() => validator.validate(
                    {
                        range: {
                            units: "ft",
                            value: 30
                        },
                        duration: {
                            concentration: false,
                            units: "inst"
                        },
                        target: {
                            override: false,
                            prompt: false
                        },
                        uses: {
                            spent: 0,
                            recovery: [],
                            max: ""
                        },
                        consumption: {
                            targets: []
                        },
                        effects: [
                            {
                                effect: {
                                    name: "Daemonic Brand Saving Throw Penalty",
                                    description: "\nThe creature takes a \u20132 penalty on all saving throws.\n\n"
                                }
                            }
                        ]
                    },
                    dto
                ))
                    .not
                    .to
                    .throw()
            })

            it("validates actor effect collections when invoked through ActorValidationDTO", function ()
            {
                const actor = createActorValidationStub()
                const actorDto = new ActorValidationDTO(actor)

                actorDto.effects.count = 1
                actorDto.effects.has.push("General Effect")

                expect(() => validate(actorDto, {assert}))
                    .not
                    .to
                    .throw()
            })

            it("resolves actor-level single-effect assertions from the actor effect collection", function ()
            {
                const actor = createActorValidationStub()
                const actorDto = new ActorValidationDTO(actor)

                actorDto.effects.name = "General Effect"
                actorDto.effects.count = 1

                expect(() => validate(actorDto, {assert}))
                    .not
                    .to
                    .throw()
            })
        })
    }
)
