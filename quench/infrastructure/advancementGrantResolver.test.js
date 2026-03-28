import { createAdvancementGrantResolver } from "../../infrastructure/foundry/createAdvancementGrantResolver.js"

const ADD_MODE = globalThis.CONST?.ACTIVE_EFFECT_MODES?.ADD ?? 2

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

function createActor()
{
    return {
        id: "actor-1",
        uuid: "Actor.actor-1"
    }
}

function createResolver({
    createResult = { id: "effect-1" }
} = {})
{
    const calls = {
        createdEffects: []
    }

    const resolver = createAdvancementGrantResolver({
        activeEffectRepository: {
            async create(effectData)
            {
                calls.createdEffects.push(effectData)
                return createResult
            }
        },
        logger: createLogger()
    })

    return {
        calls,
        resolver
    }
}

quench.registerBatch(
    "transformations.infrastructure.advancementGrantResolver",
    ({ describe, it, expect }) =>
    {
        describe("createAdvancementGrantResolver", function()
        {
            it("creates a hidden damage vulnerability effect for supported grants", async function()
            {
                const actor = createActor()
                const sourceItem = { uuid: "Item.item-1" }
                const { calls, resolver } = createResolver()

                const result = await resolver.resolve({
                    actor,
                    grant: "dv:acid",
                    sourceItem
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0]).to.deep.equal({
                    actor,
                    name: "Damage Vulnerability: Acid",
                    label: "Acid",
                    description: "Gain vulnerability to acid damage.",
                    source: "transformation",
                    icon: "modules/transformations/icons/damageTypes/Acid.png",
                    origin: "Item.item-1",
                    changes: [
                        {
                            key: "system.traits.dv.value",
                            mode: ADD_MODE,
                            value: "acid"
                        }
                    ],
                    flags: {
                        dnd5e: {
                            hidden: true
                        },
                        transformations: {
                            advancementGrant: "dv:acid",
                            advancementGrantType: "damageVulnerability"
                        }
                    }
                })
            })

            it("returns false and does not create an effect for unsupported grants", async function()
            {
                const { calls, resolver } = createResolver()

                const result = await resolver.resolve({
                    actor: createActor(),
                    grant: "foo:acid"
                })

                expect(result).to.equal(false)
                expect(calls.createdEffects).to.have.length(0)
            })
        })
    }
)
