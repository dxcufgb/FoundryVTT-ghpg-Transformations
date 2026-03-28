import { createActorFlagAction } from "../../../services/actions/handlers/actorFlags.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

export function registerActorFlagActionTests({
    describe,
    it,
    expect
})
{
    describe("Actor Flag Action Handler", function()
    {
        let handler
        let actor

        beforeEach(function()
        {
            actor = {
                flags: {
                    transformations: {
                        fiend: {
                            counter: 2,
                            skills: ["arc", "ins"]
                        }
                    }
                },
                setCalls: [],
                unsetCalls: [],
                async setFlag(scope, key, value)
                {
                    this.setCalls.push({
                        scope,
                        key,
                        value
                    })
                },
                async unsetFlag(scope, key)
                {
                    this.unsetCalls.push({
                        scope,
                        key
                    })
                }
            }

            handler = createActorFlagAction({
                tracker: createFakeTracker(),
                logger: createLogger()
            })
        })

        it("sets a flag by full path using an expression against the current value", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "set",
                        path: "flags.transformations.fiend.counter",
                        expression: "@currentValue - 1"
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(true)
            expect(actor.setCalls[0]).to.deep.equal({
                scope: "transformations",
                key: "fiend.counter",
                value: 1
            })
        })

        it("checks a flag value against an expression", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.counter",
                        expression: "@currentValue > 0"
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(true)
        })

        it("checks array flags using a dynamic value path from context", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.skills",
                        valuePath: "@context.skill"
                    }
                },
                context: {
                    skill: "arc"
                },
                variables: {}
            })

            expect(result).to.equal(true)
        })

        it("returns false when an expression check does not pass", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.counter",
                        expression: "@currentValue < 0"
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(false)
        })

        it("removes a flag by full path", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "remove",
                        path: "flags.transformations.fiend.counter"
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(true)
            expect(actor.unsetCalls[0]).to.deep.equal({
                scope: "transformations",
                key: "fiend.counter"
            })
        })
    })
}
