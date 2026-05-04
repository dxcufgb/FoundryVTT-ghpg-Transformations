import { RollTableEffect } from "../../domain/rollTable/RollTableEffect.js"

class ExamplePowerfullEffect extends RollTableEffect
{
    static meta = {
        name: "Example Powerful Effect"
    }
}

class ExampleFallbackEffect extends RollTableEffect
{
}

quench.registerBatch(
    "transformations.domain.rollTableEffect",
    ({describe, it, expect}) =>
    {
        describe("RollTableEffect", function ()
        {
            it("uses meta.name when creating an active effect", async function ()
            {
                let createdPayload = null

                const effect = new ExamplePowerfullEffect({
                    actor: {},
                    activeEffectRepository: {
                        create: async payload =>
                        {
                            createdPayload = payload
                        }
                    },
                    stringUtils: {
                        humanizeClassName: () => "Example Powerfull Effect"
                    },
                    moduleFolderPath: "test/icon.webp"
                })

                await effect.apply()

                expect(createdPayload.name).to.equal("Example Powerful Effect")
            })

            it("falls back to the humanized class name when meta.name is missing", async function ()
            {
                let createdPayload = null

                const effect = new ExampleFallbackEffect({
                    actor: {},
                    activeEffectRepository: {
                        create: async payload =>
                        {
                            createdPayload = payload
                        }
                    },
                    stringUtils: {
                        humanizeClassName: () => "Example Fallback Effect"
                    },
                    moduleFolderPath: "test/icon.webp"
                })

                await effect.apply()

                expect(createdPayload.name).to.equal("Example Fallback Effect")
            })
        })
    }
)
