import { replaceSyntheticMidiActivityCard } from "../../ui/chatCards/SyntheticMidiActivityCard.js"

function createMessage(content)
{
    return {
        content,
        async update(data)
        {
            this.content = data.content
        }
    }
}

quench.registerBatch(
    "transformations.SyntheticMidiActivityCard",
    ({ describe, it, expect }) =>
    {
        describe("replaceSyntheticMidiActivityCard", () =>
        {
            it("replaces the existing synthetic card in place", async () =>
            {
                const message = createMessage(
                    `<div class="midi-card"><div class="midi-buttons"><div data-transformations-card="true">old</div></div></div>`
                )

                await replaceSyntheticMidiActivityCard({
                    message,
                    content: `<div data-transformations-card="true">new</div>`
                })

                expect(message.content).to.include("new")
                expect(message.content).to.not.include(">old<")
                expect(message.content).to.include("midi-buttons")
            })

            it("keeps the midi card when the synthetic card is missing", async () =>
            {
                const message = createMessage(
                    `<div class="midi-card"><div class="midi-buttons"><button>Roll</button></div></div>`
                )

                await replaceSyntheticMidiActivityCard({
                    message,
                    content: `<div data-transformations-card="true">new</div>`
                })

                expect(message.content).to.include("midi-card")
                expect(message.content).to.include("<button>Roll</button>")
                expect(message.content).to.include("new")
            })

            it("appends to content without midi buttons instead of overwriting it", async () =>
            {
                const message = createMessage(`<p>Original</p>`)

                await replaceSyntheticMidiActivityCard({
                    message,
                    content: `<div data-transformations-card="true">new</div>`
                })

                expect(message.content).to.include("<p>Original</p>")
                expect(message.content).to.include("new")
            })
        })
    }
)
