import { validateMacroPayload } from "../../infrastructure/macros/validateMacroPayload.js"
import { createMacroExecutor } from "../../macros/createMacroExecutor.js"

const silentLogger = {
    debug() {},
    warn() {},
    error() {}
}

function createPayload(args = {})
{
    return {
        args: {
            actorUuid: "Actor.actor-1",
            ...args
        },
        transformationType: "aberrant-horror",
        action: "testAction",
        trigger: "on"
    }
}

quench.registerBatch(
    "transformations.infrastructure.macroExecutor",
    ({describe, it, expect}) =>
    {
        describe("validateMacroPayload", function()
        {
            it("accepts a payload without a tokenUuid", function()
            {
                expect(validateMacroPayload(createPayload(), {logger: silentLogger})).to.equal(true)
            })

            it("rejects a tokenUuid that is not a string", function()
            {
                expect(validateMacroPayload(createPayload({tokenUuid: 42}), {logger: silentLogger})).to.equal(false)
            })
        })

        describe("createMacroExecutor", function()
        {
            it("runs the handler for an actor that has no token", async function()
            {
                const actor = {id: "actor-1", getFlag: () => null, flags: {}}
                const calls = []
                const executor = createMacroExecutor({
                    actorRepository: {
                        getByUuid: async () => actor,
                        hasMacroExecution: () => false,
                        setMacroExecution: async () => {},
                        clearMacroExecution: async () => {}
                    },
                    tokenRepository: {
                        getByUuid: async () =>
                        {
                            throw new Error("token lookup should be skipped")
                        }
                    },
                    itemRepository: {},
                    socketGateway: {canMutateLocally: () => true},
                    activeEffectRepository: {},
                    macroRegistry: {
                        get: () => ({
                            createHandlers: () => ({
                                async testAction(args)
                                {
                                    calls.push(args)
                                }
                            })
                        })
                    },
                    macroContextFactory: {
                        createFromToken: () =>
                        {
                            throw new Error("context should not be built without a token")
                        }
                    },
                    tracker: {track: promise => promise, whenIdle: async () => {}},
                    logger: silentLogger,
                    notify: {warn() {}}
                })

                await executor.executeMacro(createPayload())

                expect(calls).to.have.length(1)
                expect(calls[0].actor).to.equal(actor)
                expect(calls[0].token).to.equal(null)
                expect(calls[0].context).to.equal(null)
            })
        })
    }
)
