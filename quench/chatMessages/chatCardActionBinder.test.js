import { ChatCardActionBinder } from "../../ui/chatCards/ChatCardActionBinder.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

quench.registerBatch(
    "transformations.chatMessages.ChatCardActionBinder",
    ({ describe, it, expect }) =>
    {
        let originalGet

        beforeEach(function()
        {
            originalGet = game.actors.get.bind(game.actors)
        })

        afterEach(function()
        {
            game.actors.get = originalGet
        })

        describe("ChatCardActionBinder", function()
        {
            it("dispatches the configured gift action when a transformations action button is clicked", async function()
            {
                let receivedArgs = null
                const actor = { id: "actor-1" }
                const actorRepository = { kind: "actorRepository" }
                const ChatMessagePartInjector = { kind: "injector" }
                const RollService = { kind: "rollService" }

                game.actors.get = () => actor

                const html = document.createElement("div")
                html.innerHTML = `
                    <div data-transformations-card data-gift="giftOfUnsurpassedFortune">
                        <button type="button" data-transformations-action="rollDamage">Roll Damage</button>
                    </div>
                `

                ChatCardActionBinder.bind({
                    message: {
                        speaker: {
                            actor: actor.id
                        }
                    },
                    html,
                    giftsOfDamnation: [
                        {
                            id: "giftOfUnsurpassedFortune",
                            GiftClass: {
                                actions: {
                                    async rollDamage(args)
                                    {
                                        receivedArgs = args
                                    }
                                }
                            }
                        }
                    ],
                    actorRepository,
                    ChatMessagePartInjector,
                    RollService,
                    logger: {
                        debug() {},
                        warn() {}
                    }
                })

                html.querySelector("[data-transformations-action='rollDamage']").click()
                await nextTick()

                expect(receivedArgs.actor).to.equal(actor)
                expect(receivedArgs.actorRepository).to.equal(actorRepository)
                expect(receivedArgs.ChatMessagePartInjector).to.equal(ChatMessagePartInjector)
                expect(receivedArgs.RollService).to.equal(RollService)
                expect(receivedArgs.element.dataset.transformationsAction).to.equal("rollDamage")
            })

            it("ignores generic data-action buttons so dnd5e actions do not collide with gift actions", async function()
            {
                let actionCount = 0

                game.actors.get = () => ({ id: "actor-1" })

                const html = document.createElement("div")
                html.innerHTML = `
                    <div data-transformations-card data-gift="giftOfUnsurpassedFortune">
                        <button type="button" data-action="rollDamage">Roll Damage</button>
                    </div>
                `

                ChatCardActionBinder.bind({
                    message: {
                        speaker: {
                            actor: "actor-1"
                        }
                    },
                    html,
                    giftsOfDamnation: [
                        {
                            id: "giftOfUnsurpassedFortune",
                            GiftClass: {
                                actions: {
                                    async rollDamage()
                                    {
                                        actionCount++
                                    }
                                }
                            }
                        }
                    ],
                    actorRepository: {},
                    ChatMessagePartInjector: {},
                    RollService: {},
                    logger: {
                        debug() {},
                        warn() {}
                    }
                })

                html.querySelector("[data-action='rollDamage']").click()
                await nextTick()

                expect(actionCount).to.equal(0)
            })

            it("binds only once for a card even if bind is called repeatedly", async function()
            {
                let actionCount = 0

                game.actors.get = () => ({ id: "actor-1" })

                const html = document.createElement("div")
                html.innerHTML = `
                    <div data-transformations-card data-gift="giftOfJoyousLife">
                        <button type="button" data-transformations-action="applyDamage">Apply Damage</button>
                    </div>
                `

                const bindData = {
                    message: {
                        speaker: {
                            actor: "actor-1"
                        }
                    },
                    html,
                    giftsOfDamnation: [
                        {
                            id: "giftOfJoyousLife",
                            GiftClass: {
                                actions: {
                                    async applyDamage()
                                    {
                                        actionCount++
                                    }
                                }
                            }
                        }
                    ],
                    actorRepository: {},
                    ChatMessagePartInjector: {},
                    RollService: {},
                    logger: {
                        debug() {},
                        warn() {}
                    }
                }

                ChatCardActionBinder.bind(bindData)
                ChatCardActionBinder.bind(bindData)

                html.querySelector("[data-transformations-action='applyDamage']").click()
                await nextTick()

                expect(actionCount).to.equal(1)
            })
        })
    }
)
