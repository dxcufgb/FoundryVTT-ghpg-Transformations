import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../../config/constants.js"
import { D20Identifiers, D20RollKeys } from "../../../../config/disadvantageOnAllD20Rolls.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorStatsDTO, ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { ContextValidationDTO } from "../../../helpers/validationDTOs/context/ContextValidationDTO.js"
import { EffectValidationDTO } from "../../../helpers/validationDTOs/effect/EffectValidationDTO.js"
import { MessageValidationDTO } from "../../../helpers/validationDTOs/message/MessageValidationDTO.js"
// test/definitions/aberrantHorror.testdef.js
export const AberrantHorrorTestDef = {
    id: "aberrant-horror",
    rollTableOrigin: "Unstable Form",
    scenarios: [
        {
            name: "stage 1",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 2 with Efficient Killer",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 2 with Writhing Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 3 with Terrifying Visage due to no options",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 3 with Constricting Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 3 with Terrifying Visage as an option",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 4 Entropic Abomation with no actor spell slots",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 4 Entropic Abomation with actor spell slots",
            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.spells.spell1.override": 1,
                    "system.spells.spell1.value": 1
                })
            },
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "stage 4 Poisonouse Mutations with actor spell slots",
            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.spells.spell1.override": 1,
                    "system.spells.spell1.value": 1
                })
            },
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz"
                ]
                validate(actorDto, { assert })
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 1",

            setup: async ({ runtime }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 60
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    trigger: "longRest"
                }
            ],

            finalAwait: async ({ actor, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.count = 1
                effectsDto.has = ["Aberrant Slow Speech"]
                effectsDto.withOrigin = { origin: "Unstable Form", expected: 1 }

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })

                const messageDto = new MessageValidationDTO("RollTable")
                messageDto.count = 1
                messageDto.flavors.values = ["Unstable Form Stage 1"]
                validate(messageDto, { assert })
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 2",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 70
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }

                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    trigger: "longRest",
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const messageDto = new MessageValidationDTO("RollTable")
                messageDto.count = 1
                messageDto.flavors.values = ["Unstable Form Stage 2"]

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has = ["Aberrant Slow Speech"]
                effectDto.withOrigin = { origin: "Unstable Form", expected: 1 }

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectDto

                validate(messageDto, { assert })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 3",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 80
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    trigger: "longRest",
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const messageDto = new MessageValidationDTO("RollTable")
                messageDto.count = 1
                messageDto.flavors.values = ["Unstable Form Stage 3"]

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has = ["Aberrant Slow Speech"]
                effectDto.withOrigin = { origin: "Unstable Form", expected: 1 }

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectDto

                validate(messageDto, { assert })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 4",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 90
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                },
                {
                    trigger: "longRest",

                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForDomainStability({
                            actor,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                    }
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const messageDto = new MessageValidationDTO("RollTable")
                messageDto.count = 1
                messageDto.flavors.values = ["Unstable Form Stage 4"]

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has = ["Aberrant Slow Speech"]
                effectDto.withOrigin = { origin: "Unstable Form", expected: 1 }

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectDto

                validate(messageDto, { assert })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Loss Of Vitality removes all modifiers from hit die rolls",

            setup: async ({ game, actor, staticVars }) =>
            {
                staticVars.context = {
                    rolls: [
                        {
                            parts: [
                                "max(1, 1d8 + @abilities.con.mod)"
                            ]
                        }
                    ]
                }
                const effect = game.transformations.getEffectInstance(actor, "AberrantLossOfVitality")
                await effect.apply(actor)
            },

            steps: [
                {
                    await: async ({ runtime, actor, waiters, staticVars }) =>
                    {
                        const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                        transformation.TransformationClass.onPreRollHitDie(staticVars.context, actor)
                    }
                }
            ],

            finalAssertions: async ({ staticVars, assert, validators }) =>
            {
                const contextDto = new ContextValidationDTO(staticVars.context)
                contextDto.rolls.values = [{ parts: ["max(1, 1d8 )"] }]

                validate(contextDto, { assert })
            }
        },

        {
            name: "Aberrant Confusion adds stunned for first round of combat after initiative",

            setup: async ({ game, actor, staticVars }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                const effect = game.transformations.getEffectInstance(actor, "AberrantConfusion")
                await effect.apply(actor)
            },

            steps: [
                {
                    trigger: "initiative",
                    await: async ({ runtime, actor, waiters, staticVars }) =>
                    {
                        await waiters.waitForDomainStability({
                            actor,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                    }
                }
            ],

            finalAwait: async ({ actor, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.effects.find(e => e.name == "Stunned")
                )
            },

            finalAssertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasEffect = "Stunned"

                const messageDto = new MessageValidationDTO("NA")
                messageDto.count = 1
                messageDto.contents.values = [
                    `Due to Aberrant Confusion ${actor.name} is stunned for the first round!`
                ]
                messageDto.contents.mode = "equal"

                validate(messageDto, { assert })
                validate(actorDto, { assert })
            }
        },
    ],

    itemBehaviorTests: [
        {
            name: "Aberrant Form grants temp HP when bloodied",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, runtime }) =>
                {
                    await runtime.services.triggerRuntime.run("bloodied", actor)
                }
            ],

            await: async ({
                waiters,
                actor
            }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.attributes.hp.temp > 0
                )
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const prof = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [{ value: 1 + prof, variant: "temp" }]
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = ["Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu"]
                    item.usesLeft = 0
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Form only grants temp HP once per rest",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    // 1️⃣ Find item fresh
                    let item = actor.items.find(i =>
                        i.flags.transformations?.sourceUuid ===
                        "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu"
                    )

                    if (!item) throw new Error("Aberrant Form item not found")

                    // 2️⃣ Spend all uses
                    await item.update({
                        "system.uses.spent": item.system.uses.max
                    })

                    // 3️⃣ Wait for Foundry to fully process
                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })

                    // 4️⃣ Re-fetch item (avoid stale reference)
                    item = actor.items.get(item.id)

                    // 5️⃣ Ensure update actually applied
                    await waiters.waitForCondition(() =>
                    {
                        const fresh = actor.items.get(item.id)
                        return fresh?.system.uses.spent === fresh?.system.uses.max
                    })
                },

                async ({ actor, runtime, waiters }) =>
                {
                    // 6️⃣ Explicitly trigger bloodied
                    await runtime.services.triggerRuntime.run("bloodied", actor)

                    // 7️⃣ Wait for trigger execution
                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [{ value: 0, variant: "temp" }]
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Mutation: Chitinous Shell applies AC +2 and -10 movement",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.match = {
                    expected: 1,
                    matchMode: "or",
                    filters: [
                        { key: "name", value: "Chitinous Shell" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }

                actorDto.stats.ac = 12
                actorDto.stats.movementSpeed = [{ type: "walk", value: 20 }]
                actorDto.effects = effectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Mutation: Eldritch Limbs grants weapon",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO(actor)

                effectDto.match = {
                    expected: 1,
                    matchMode: "or",
                    filters: [
                        { key: "name", value: "Eldritch Limbs" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }

                actorDto.addItem(item =>
                {
                    item.itemName = "Eldritch Limbs"
                    item.type = "weapon"
                })

                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Mutation: Eldritch Limbs weapon attacks",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.addItem(item =>
                {
                    item.itemName = "Eldritch Limbs"
                    item.type = "weapon"
                    item.addActivity(activity =>
                    {
                        activity.abilityTypes = ["str", "dex"]
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.damageTypes = ["bludgeoning", "piercing", "slashing"]
                            damagePart.roll = "1d8"
                        })
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Mutation: Slimy Form grants acid, fire and cold resistance",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.stats.resistances = ["acid", "fire", "cold"]

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.match = {
                    expected: 1,
                    matchMode: "or",
                    filters: [
                        { key: "name", value: "Slimy Form" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }

                actorDto.effects = effectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Switching activities replaces previous effect Chitinous shell -> Slimy Form",

            requiredPath: [
                { stage: 1 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                },

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.stats.resistances = ["acid", "fire", "cold"]
                actorDto.stats.ac = 10

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.match = {
                    expected: 1,
                    matchMode: "or",
                    filters: [
                        { key: "name", value: "Slimy Form" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }

                actorDto.effects = effectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Switching activities replaces previous effect Slimy Form -> Chitinous shell",

            requiredPath: [
                { stage: 1 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                },

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                }

            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.notResistances = ["acid", "fire", "cold"]
                actorDto.stats.ac = 12

                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.match = {
                    expected: 1,
                    matchMode: "or",
                    filters: [
                        { key: "name", value: "Chitinous Shell" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }

                actorDto.effects = effectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Efficient killer grants updated Eldritch Limbs",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const validationLoopConstants = [
                    {
                        name: "Eldritch Limbs (Bludgeoning)",
                        damageTypes: ["bludgeoning"],
                        damageRoll: "2d8"
                    },
                    {
                        name: "Eldritch Limbs (Piercing)",
                        damageTypes: ["piercing"],
                        damageRoll: "2d6"
                    },
                    {
                        name: "Eldritch Limbs (Slashing)",
                        damageTypes: ["slashing"],
                        damageRoll: "2d8"
                    }
                ]

                for (const constant of validationLoopConstants) {

                    const actorDto = new ActorValidationDTO(actor)

                    actorDto.addItem(item =>
                    {
                        item.itemName = constant.name
                        item.addActivity(activity =>
                        {
                            activity.abilityTypes = ["str", "dex"]
                            activity.addDamagePart(damagePart =>
                            {
                                damagePart.damageTypes = constant.damageTypes
                                damagePart.roll = constant.damageRoll
                            })
                        })
                    })

                    validate(actorDto, { assert })
                }
            }
        },

        {
            name: "Writhing Tendrils",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
                }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const prof = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Writhing Tendrils"
                    item.addActivity(activity =>
                    {
                        activity.name = "Aberrant Pushback"
                        activity.saveAbility = ["str"]
                        activity.saveDc = prof + 2 + 8
                        activity.activationType = "reaction"
                    })
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Writhing Tendrils"
                    item.addActivity(activity =>
                    {
                        activity.name = "Aberrant Disengage"
                        activity.activationType = "bonus"
                    })
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Writhing Tendrils"
                    item.addActivity(activity =>
                    {
                        activity.name = "Aberrant Affliction"
                        activity.spellUuid = "Compendium.transformations.gh-transformations.Item.5t4cjiimldjKmwlK"
                        activity.activationType = "reaction"
                    })
                })
            }
        },

        {
            name: "Hideous Appearance hide hideous form",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            steps: [

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw success on bloodied",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw fail on bloodied",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw success on unconscious",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "unconscious",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw fail on unconscious",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "unconscious",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw success on beginConcentration",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "concentration",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Hideous Appearance saving throw fail on beginConcentration",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "concentration",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push("Hiding Hideous Appearance")

                actorDto.effects = effectDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Terrifying Visage saving throw details",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                            3: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Terrifying Visage"
                    item.addActivity(activity =>
                    {
                        activity.saveAbility = ["wis"]
                        activity.saveDc = (8 + actorProf + 3)
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Constricting Tendrils saving throw details",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Constricting Tendrils"
                    item.addActivity(activity =>
                    {
                        activity.name = "Constrict"
                        activity.saveAbility = ["str", "dex"]
                        activity.saveDc = (8 + actorProf + 3)
                    })
                })
                validate(actorDto, { assert })
            }
        },

        {
            name: "Unstable Existence saving throws results of 3 or higher does not trigger roll on unstable form table",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 }
            ],

            steps: [
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 10
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: true,
                                naturalRoll: 3,
                                total: 3
                            }
                        }
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorEffectDto = new EffectValidationDTO()
                actorEffectDto.name = "Aberrant Powerfull Lower Limbs"
                actorEffectDto.count = 1

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = actorEffectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Unstable Existence saving throws results of 2 triggers roll on unstable form table",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 }
            ],

            steps: [
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 10
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: true,
                                naturalRoll: 2,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert }) =>
            {
                const actorEffectDto = new EffectValidationDTO()
                actorEffectDto.name = "Aberrant Confusions"
                actorEffectDto.count = 1

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = actorEffectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Unstable Existence saving throws results of 2 triggers roll on unstable form table, not applied due to not being lower result",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 }
            ],

            steps: [
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 10
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, helpers }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                isSpell: true,
                                naturalRoll: 2,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert }) =>
            {
                const actorEffectDto = new EffectValidationDTO()
                actorEffectDto.name = "Aberrant Confusions"
                actorEffectDto.count = 1

                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = actorEffectDto

                validate(actorDto, { assert })
            }
        },

        {
            name: "Eldritch Aberration damage types and dice rolls",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.addItem(item =>
                {
                    item.itemName = "Eldritch Aberration"
                    item.type = "spell"
                    item.addActivity(activity =>
                    {
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "1d6",
                                damagePart.damageTypes = [
                                    "acid",
                                    "cold",
                                    "fire",
                                    "force",
                                    "lightning",
                                    "thunder"
                                ]
                        })
                    })
                })

                validate(actorDto, { assert })
            }
        },

        {
            name: "Poisonous Mutations damage types and dice rolls",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.addItem(item =>
                {
                    item.itemName = "Poisonous Mutations"
                    item.addActivity(activity =>
                    {
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "3d6"
                            damagePart.damageTypes = ["poison"]
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.type = "auraeffects.aura"
                        effect.collisionTypes = ["move"]
                        effect.distanceFormula = "1"
                    })
                })
            }
        },

        {
            name: "Poisonous Mutations applied when Chitinous Shell is activated",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.match = {
                    expected: 2,
                    matchMode: "and",
                    filters: [
                        { key: "name", value: "Chitinous Shell" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Poisonous Mutations applied when Eldritch Limbs is activated",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.match = {
                    expected: 2,
                    matchMode: "and",
                    filters: [
                        { key: "name", value: "Eldritch Limbs" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Poisonous Mutations applied when Slimy Form is activated",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.match = {
                    expected: 2,
                    matchMode: "and",
                    filters: [
                        { key: "name", value: "Slimy Form" },
                        { key: "name", value: "Poisonous Mutations" }
                    ]
                }
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Entropic Abomination applied when actor is bloodied and result on rolltable is lower than current",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 26
                }
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.effects.find(e => e.name == "Aberrant Confusion")
                )
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.count = 1
                effectsDto.has.push("Aberrant Confusion")
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Entropic Abomination not applied when actor is bloodied and result on rolltable is not lower than current",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 26
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                }
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.count = 1
                effectsDto.has.push("Aberrant Confusion")
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },

        {
            name: "Entropic Abomination applied when actor fails saving throw and result on rolltable is lower than current",

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 5
                globalThis.___TransformationTestEnvironment___.saveRolled = false
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 26
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                naturalRoll: 3,
                                total: 3,
                                success: false
                            }
                        }
                    })
                }
            ],

            trigger: "savingThrow",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.effects.find(e => e.name == "Aberrant Confusion")
                )
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push("Aberrant Confusion")
                dto.effects.count = 1
                validate(dto, { assert })
            }
        },

        {
            name: "Entropic Abomination not applied when actor fails saving throw and result on rolltable is not lower than current",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 26
                    await runtime.services.triggerRuntime.run("longRest", actor)
                },
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 100
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        saves: {
                            current: {
                                ability: "wis",
                                naturalRoll: 3,
                                total: 3,
                                success: false
                            }
                        }
                    })
                }
            ],

            trigger: "savingThrow",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push("Aberrant Confusion")
                dto.effects.count = 1
                validate(dto, { assert })
            }
        },

        {
            name: "Entropic Abomination not applied when actor succeeds saving throw and result on rolltable is lower than current",

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "aberrant-horror": {
                            2: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                            3: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                            4: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                        }
                    }
                })
            },

            requiredPath: [
                { stage: 1 },
                { stage: 2 },
                { stage: 3 },
                { stage: 4 }
            ],

            steps: [
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 93
                    await runtime.services.triggerRuntime.run("longRest", actor)
                    await waiters.waitForCondition(() =>
                        actor.effects.find(e => e.name == "Aberrant Slow Speech")
                    )
                },
                async ({ actor, runtime, waiters }) =>
                {
                    globalThis.___TransformationTestEnvironment___.rollTableResult = 26
                    await runtime.services.triggerRuntime.run("savingThrow", actor, {
                        ability: "wis",
                        naturalRoll: 20,
                        total: 20,
                        success: true
                    })
                }
            ],

            trigger: "savingThrow",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },
            assertions: async ({ actor, assert, validators }) =>
            {
                const effectsDto = new EffectValidationDTO()
                effectsDto.count = 1
                effectsDto.has.push("Aberrant Slow Speech")
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects = effectsDto
                validate(actorDto, { assert })
            }
        },
    ],

    rollTableEffects: [
        {
            name: "Aberrant Resilience",
            key: "AberrantResilience",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.rollModes.advantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })
                actorDto.effects.has.push(name)
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Temporary Vitality Boost",
            key: "AberrantTemporaryVitalityBoost",
            setup: async ({ actor, helpers }) =>
            {
                await actor.setFlag("transformations", "stage", 1)
            },
            assertion: async ({ origin, actor, assert, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp.push({ value: 4, variant: "temp" })
                actorDto.effects.notHas.push(origin)
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Powerfull Lower Limbs",
            key: "AberrantPowerfullLowerLimbs",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.stats.movementBonus = 5
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant No Effect",
            key: "AberrantNoEffect",
            assertion: async ({ origin, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.notHas.push(origin)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Slow Speech",
            key: "AberrantSlowSpeech",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Loss Of Vitality",
            key: "AberrantLossOfVitality",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Clumsiness",
            key: "AberrantClumsiness",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.rollModes.disadvantage.push(
                    { identifier: ABILITY.DEXTERITY, type: ROLL_TYPE.ABILITY_CHECK },
                    { identifier: ABILITY.DEXTERITY, type: ROLL_TYPE.SAVING_THROW }
                )
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Defenseless",
            key: "AberrantDefenseless",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.rollModes.disadvantage.push(
                    { identifier: ABILITY.CONSTITUTION, type: ROLL_TYPE.SAVING_THROW }
                )
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Distraction",
            key: "AberrantDistraction",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.rollModes.disadvantage.push(
                    { identifier: SKILL.PERCEPTION }
                )
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Slugginess",
            key: "AberrantSlugginess",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Slowness",
            key: "AberrantSlowness",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.stats.movementBonus = -15
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Confusion",
            key: "AberrantConfusion",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.has.push(name)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Exhaustion",
            key: "AberrantExhaustion",
            assertion: async ({ origin, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.effects.notHas.push(origin)
                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Disadvantage",
            key: "AberrantDisadvantage",
            assertion: async ({ name, actor, assert, helpers, validators }) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.effects.has.push(name)
                for (const ability of D20Identifiers.abilities) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: ability, type: ROLL_TYPE.ABILITY_CHECK },
                        { identifier: ability, type: ROLL_TYPE.SAVING_THROW }
                    )
                }
                for (const attribute of D20Identifiers.attributes) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: attribute }
                    )
                }
                for (const skill of D20Identifiers.skills) {
                    actorDto.rollModes.disadvantage.push(
                        { identifier: skill }
                    )
                }
                actorDto.rollModes.toolDisadvantage = "1"
                validate(actorDto, { assert })
            }
        },

        {
            name: "Aberrant Weakness",
            key: "AberrantWeakness",
            assertion: async ({ name, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.stats.hp.push(
                    { value: 5, variant: "effectiveMax" },
                    { value: 5, variant: "value" }
                )
                dto.effects.has.push(name)

                validate(dto, { assert })
            }
        },

        {
            name: "Aberrant Overload",
            key: "AberrantOverload",
            assertion: async ({ origin, actor, assert, validators }) =>
            {
                const dto = new ActorValidationDTO(actor)
                dto.stats.hp.push(
                    { value: 0, variant: "temp" },
                    { value: 0, variant: "value" }
                )
                dto.stats.deathSaveDelta = -3
                dto.effects.notHas.push(origin)
                validate(dto, { assert })
            }
        },
    ]
}