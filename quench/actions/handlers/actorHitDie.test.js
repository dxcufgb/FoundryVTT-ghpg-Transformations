import { createActorHitDieAction } from "../../../services/actions/handlers/actorHitDie.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

export function registerActorHitDieActionTests({
    describe,
    it,
    expect
})
{
    describe("Actor Hit Die Action Handler", function()
    {
        let actor
        let actorRepository
        let itemRepository
        let calls
        let handler

        beforeEach(function()
        {
            actor = {
                id: "actor-1"
            }

            calls = {
                consumed: [],
                updates: []
            }

            actorRepository = {
                getAvailableHitDice: () => 0,
                consumeHitDie: async (_actor, amount) =>
                {
                    calls.consumed.push(amount)
                }
            }

            itemRepository = {
                findAllEmbeddedByType: () => []
            }

            handler = createActorHitDieAction({
                actorRepository,
                itemRepository,
                tracker: createFakeTracker(),
                logger: createLogger()
            })
        })

        it("consumes hit dice when lowering the actor's remaining total", async function()
        {
            actorRepository.getAvailableHitDice = () => 5
            itemRepository.findAllEmbeddedByType = () => [
                {
                    system: {
                        hd: {
                            value: 3,
                            spent: 1,
                            denomination: "d8"
                        }
                    }
                },
                {
                    system: {
                        hd: {
                            value: 2,
                            spent: 0,
                            denomination: "d10"
                        }
                    }
                }
            ]

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "set",
                        value: 3
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(true)
            expect(calls.consumed).to.deep.equal([2])
        })

        it("restores hit dice from the highest denominations first", async function()
        {
            actorRepository.getAvailableHitDice = () => 1
            itemRepository.findAllEmbeddedByType = () => [
                {
                    name: "Wizard",
                    system: {
                        hd: {
                            value: 1,
                            spent: 2,
                            denomination: "d6"
                        }
                    },
                    update: async data =>
                    {
                        calls.updates.push({
                            name: "Wizard",
                            data
                        })
                    }
                },
                {
                    name: "Fighter",
                    system: {
                        hd: {
                            value: 0,
                            spent: 1,
                            denomination: "d10"
                        }
                    },
                    update: async data =>
                    {
                        calls.updates.push({
                            name: "Fighter",
                            data
                        })
                    }
                }
            ]

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "set",
                        value: "@target"
                    }
                },
                context: {},
                variables: {
                    target: 3
                }
            })

            expect(result).to.equal(true)
            expect(calls.consumed).to.deep.equal([])
            expect(calls.updates).to.deep.equal([
                {
                    name: "Fighter",
                    data: {
                        "system.hd.value": 1,
                        "system.hd.spent": 0
                    }
                },
                {
                    name: "Wizard",
                    data: {
                        "system.hd.value": 2,
                        "system.hd.spent": 1
                    }
                }
            ])
        })

        it("does not increase remaining hit dice when preferLower is enabled and the actor is already lower", async function()
        {
            actorRepository.getAvailableHitDice = () => 2
            itemRepository.findAllEmbeddedByType = () => [
                {
                    system: {
                        hd: {
                            value: 2,
                            spent: 1,
                            denomination: "d8"
                        }
                    },
                    update: async data =>
                    {
                        calls.updates.push(data)
                    }
                }
            ]

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "set",
                        value: 5,
                        preferLower: true
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(false)
            expect(calls.consumed).to.deep.equal([])
            expect(calls.updates).to.deep.equal([])
        })

        it("returns false when the actor has no class items", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "set",
                        value: 1
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(false)
            expect(calls.consumed).to.deep.equal([])
            expect(calls.updates).to.deep.equal([])
        })
    })
}
