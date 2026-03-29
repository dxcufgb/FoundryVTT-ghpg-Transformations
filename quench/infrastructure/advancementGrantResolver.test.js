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
        uuid: "Actor.actor-1",
        system: {
            skills: {
                acr: { value: 0 },
                arc: { value: 0 },
                ath: { value: 0 },
                sur: { value: 0 }
            }
        }
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

            it("creates a hidden skill proficiency effect for supported skill grants", async function()
            {
                const actor = createActor()
                const { calls, resolver } = createResolver()

                const result = await resolver.resolve({
                    actor,
                    grant: "skills:arc:upgrade"
                })

                expect(result).to.equal(true)
                expect(calls.createdEffects).to.have.length(1)
                expect(calls.createdEffects[0]).to.deep.equal({
                    actor,
                    name: "Skill Proficiency: Arcana",
                    label: "Arcana",
                    description: "Gain proficiency in Arcana.",
                    source: "transformation",
                    icon: "modules/transformations/icons/skills/Arcana.png",
                    origin: "Actor.actor-1",
                    skillIdentifier: "arc",
                    changes: [
                        {
                            key: "system.skills.arc.value",
                            mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                            value: 1
                        }
                    ],
                    flags: {
                        dnd5e: {
                            hidden: true
                        },
                        transformations: {
                            advancementGrant: "skills:arc:upgrade",
                            advancementGrantType: "skill",
                            advancementGrantMode: "upgrade"
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
