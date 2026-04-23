import { ChatMessagePartInjector } from "../../ui/chatCards/ChatMessagePartInjector.js"
import { renderMidiRequestButtons } from "../../ui/chatCards/MidiRequestButtons.js"

const TEST_TEMPLATE =
          "modules/transformations/scripts/templates/tests/chat-message-part-injector-test.hbs"

function createMessage(content)
{
    return {
        content,
        updates: [],
        async update(data)
        {
            this.updates.push(data)
            this.content = data.content
        }
    }
}

function parseContent(content)
{
    const wrapper = document.createElement("div")
    wrapper.innerHTML = String(content ?? "")
    return wrapper
}

quench.registerBatch(
    "transformations.chatMessages.ChatMessagePartInjector",
    ({describe, it, expect}) =>
    {
        describe("ChatMessagePartInjector", function ()
        {
            it("injects rendered html next to the matched selector", async function ()
            {
                const message = createMessage(
                    `<div class="midi-dnd5e-buttons"></div>`
                )

                await ChatMessagePartInjector.inject({
                    message,
                    template: TEST_TEMPLATE,
                    selector: ".midi-dnd5e-buttons",
                    templateData: {
                        state: "initial",
                        label: "Roll Hit Die"
                    }
                })

                const parsed = parseContent(message.content)
                const buttonsRoot = parsed.querySelector(".midi-dnd5e-buttons")
                const injectedCard =
                          buttonsRoot?.nextElementSibling?.matches?.("[data-transformations-card]")
                              ? buttonsRoot.nextElementSibling
                              : parsed.querySelector("[data-transformations-card]")

                expect(message.updates.length).to.equal(1)
                expect(buttonsRoot).to.exist
                expect(injectedCard).to.exist
                expect(injectedCard?.dataset?.state).to.equal("initial")
                expect(
                    injectedCard?.querySelector("button")?.textContent?.trim()
                ).to.equal("Roll Hit Die")
            })

            it("injects provided html without rendering a template", async function ()
            {
                const message = createMessage(
                    `<div class="midi-buttons"></div>`
                )

                await ChatMessagePartInjector.inject({
                    message,
                    selector: ".midi-buttons",
                    position: "afterbegin",
                    html: renderMidiRequestButtons({
                        buttons: [
                            {
                                icon: '<i class="fa-solid fa-shield-heart" inert></i>',
                                visibleLabel: "DC 16 Constitution",
                                hiddenLabel: "Constitution Saving Throw",
                                dataset: {
                                    action: "rollRequest",
                                    visibility: "all",
                                    type: "save",
                                    ability: "con",
                                    dc: "16"
                                }
                            }
                        ],
                        rootAttributes: {
                            "data-transformations-blinding-radiance-save-request": ""
                        }
                    })
                })

                const parsed = parseContent(message.content)
                const requestRoot = parsed.querySelector(
                    "[data-transformations-blinding-radiance-save-request]"
                )
                const button = requestRoot?.querySelector("button")

                expect(message.updates.length).to.equal(1)
                expect(requestRoot).to.exist
                expect(button).to.exist
                expect(button?.dataset?.action).to.equal("rollRequest")
                expect(button?.dataset?.ability).to.equal("con")
                expect(button?.dataset?.dc).to.equal("16")
                expect(
                    button?.querySelector(".visible-dc")?.textContent?.trim()
                ).to.equal("DC 16 Constitution")
                expect(
                    button?.querySelector(".hidden-dc")?.textContent?.trim()
                ).to.equal("Constitution Saving Throw")
            })

            it("replaces the matched selector with rendered html", async function ()
            {
                const message = createMessage(
                    `<div><span class="old-part">Old</span></div>`
                )

                await ChatMessagePartInjector.replace({
                    message,
                    selector: ".old-part",
                    template: TEST_TEMPLATE,
                    templateData: {
                        state: "initial",
                        label: "Roll"
                    }
                })

                const parsed = parseContent(message.content)
                const replacedCard = parsed.querySelector("[data-transformations-card]")

                expect(message.updates.length).to.equal(1)
                expect(parsed.querySelector(".old-part")).to.equal(null)
                expect(replacedCard).to.exist
                expect(
                    replacedCard?.querySelector("button")?.textContent?.trim()
                ).to.equal("Roll")
            })

            it("removes the matched selector from message content", async function ()
            {
                const message = createMessage(
                    `<div><div class="remove-me">Gone</div><div class="keep-me">Stay</div></div>`
                )

                await ChatMessagePartInjector.remove({
                    message,
                    selector: ".remove-me"
                })

                expect(message.updates.length).to.equal(1)
                expect(message.content).to.not.contain(`class="remove-me"`)
                expect(message.content).to.contain(`class="keep-me"`)
            })

            it("replaces the transformations card when replaceCard is used", async function ()
            {
                const message = createMessage(
                    `<div><section data-transformations-card class="old-card">Old</section></div>`
                )

                await ChatMessagePartInjector.replaceCard({
                    message,
                    template: TEST_TEMPLATE,
                    templateData: {
                        state: "rolled-success",
                        label: "Apply Healing"
                    }
                })

                const parsed = parseContent(message.content)
                const replacedCard = parsed.querySelector("[data-transformations-card]")

                expect(message.updates.length).to.equal(1)
                expect(parsed.querySelector(".old-card")).to.equal(null)
                expect(replacedCard).to.exist
                expect(
                    replacedCard?.querySelector("button")?.textContent?.trim()
                ).to.equal("Apply Healing")
            })
        })
    }
)
