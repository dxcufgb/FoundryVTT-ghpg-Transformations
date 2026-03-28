import { ChatMessagePartInjector } from "../../ui/chatCards/ChatMessagePartInjector.js"

const GIFT_CARD_TEMPLATE =
    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs"

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

quench.registerBatch(
    "transformations.chatMessages.ChatMessagePartInjector",
    ({ describe, it, expect }) =>
    {
        describe("ChatMessagePartInjector", function()
        {
            it("injects rendered html next to the matched selector", async function()
            {
                const message = createMessage(
                    `<div class="midi-dnd5e-buttons"></div>`
                )

                await ChatMessagePartInjector.inject({
                    message,
                    template: GIFT_CARD_TEMPLATE,
                    templateData: {
                        giftId: "giftOfJoyousLife",
                        state: "initial"
                    }
                })

                expect(message.updates.length).to.equal(1)
                expect(message.content).to.contain(`class="midi-dnd5e-buttons"`)
                expect(message.content).to.contain(`data-transformations-card`)
                expect(message.content).to.contain(`Roll Hit Die`)
                expect(
                    message.content.indexOf(`class="midi-dnd5e-buttons"`)
                ).to.be.lessThan(
                    message.content.indexOf(`data-transformations-card`)
                )
            })

            it("replaces the matched selector with rendered html", async function()
            {
                const message = createMessage(
                    `<div><span class="old-part">Old</span></div>`
                )

                await ChatMessagePartInjector.replace({
                    message,
                    selector: ".old-part",
                    template: GIFT_CARD_TEMPLATE,
                    templateData: {
                        giftId: "giftOfUnsurpassedFortune",
                        state: "initial"
                    }
                })

                expect(message.updates.length).to.equal(1)
                expect(message.content).to.not.contain(`class="old-part"`)
                expect(message.content).to.contain(`data-transformations-card`)
                expect(message.content).to.contain(`Roll`)
            })

            it("removes the matched selector from message content", async function()
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

            it("replaces the transformations card when replaceCard is used", async function()
            {
                const message = createMessage(
                    `<div><section data-transformations-card class="old-card">Old</section></div>`
                )

                await ChatMessagePartInjector.replaceCard({
                    message,
                    template: GIFT_CARD_TEMPLATE,
                    templateData: {
                        giftId: "giftOfJoyousLife",
                        state: "rolled-success",
                        roll: 7,
                        hitDie: "d8"
                    }
                })

                expect(message.updates.length).to.equal(1)
                expect(message.content).to.not.contain(`class="old-card"`)
                expect(message.content).to.contain(`data-transformations-card`)
                expect(message.content).to.contain(`Apply Healing`)
            })
        })
    }
)
