import { ChatMessagePartInjector } from "../../ui/chatCards/ChatMessagePartInjector.js"

const TEST_TEMPLATE = "test://transformations-card"

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

function installTemplateRenderer()
{
    globalThis.foundry ??= {}
    globalThis.foundry.applications ??= {}
    globalThis.foundry.applications.handlebars ??= {}

    const handlebars = globalThis.foundry.applications.handlebars
    const originalRenderTemplate = handlebars.renderTemplate

    handlebars.renderTemplate = async (_template, templateData = {}) =>
        renderTestCard(templateData)

    return () =>
    {
        if (originalRenderTemplate) {
            handlebars.renderTemplate = originalRenderTemplate
            return
        }

        delete handlebars.renderTemplate
    }
}

function renderTestCard({
    state = "",
    label = ""
} = {})
{
    return `
        <section data-transformations-card="true" class="test-card" data-state="${state}">
            <div class="card-buttons">
                <button type="button">${label}</button>
            </div>
        </section>
    `.trim()
}

quench.registerBatch(
    "transformations.chatMessages.ChatMessagePartInjector",
    ({ describe, it, expect }) =>
    {
        describe("ChatMessagePartInjector", function()
        {
            it("injects rendered html next to the matched selector", async function()
            {
                const restoreRenderer = installTemplateRenderer()
                const message = createMessage(
                    `<div class="midi-dnd5e-buttons"></div>`
                )

                try {
                    await ChatMessagePartInjector.inject({
                        message,
                        template: TEST_TEMPLATE,
                        templateData: {
                            state: "initial",
                            label: "Roll Hit Die"
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
                } finally {
                    restoreRenderer()
                }
            })

            it("replaces the matched selector with rendered html", async function()
            {
                const restoreRenderer = installTemplateRenderer()
                const message = createMessage(
                    `<div><span class="old-part">Old</span></div>`
                )

                try {
                    await ChatMessagePartInjector.replace({
                        message,
                        selector: ".old-part",
                        template: TEST_TEMPLATE,
                        templateData: {
                            state: "initial",
                            label: "Roll"
                        }
                    })

                    expect(message.updates.length).to.equal(1)
                    expect(message.content).to.not.contain(`class="old-part"`)
                    expect(message.content).to.contain(`data-transformations-card`)
                    expect(message.content).to.contain(`Roll`)
                } finally {
                    restoreRenderer()
                }
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
                const restoreRenderer = installTemplateRenderer()
                const message = createMessage(
                    `<div><section data-transformations-card class="old-card">Old</section></div>`
                )

                try {
                    await ChatMessagePartInjector.replaceCard({
                        message,
                        template: TEST_TEMPLATE,
                        templateData: {
                            state: "rolled-success",
                            label: "Apply Healing"
                        }
                    })

                    expect(message.updates.length).to.equal(1)
                    expect(message.content).to.not.contain(`class="old-card"`)
                    expect(message.content).to.contain(`data-transformations-card`)
                    expect(message.content).to.contain(`Apply Healing`)
                } finally {
                    restoreRenderer()
                }
            })
        })
    }
)
