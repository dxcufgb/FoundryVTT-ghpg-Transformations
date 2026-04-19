import { ChatMessagePartInjector } from "../../ui/chatCards/ChatMessagePartInjector.js"

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
