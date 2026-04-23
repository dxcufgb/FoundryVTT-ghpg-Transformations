export class ChatMessagePartInjector
{
    static async inject({
        message,
        html,
        template,
        templateData,
        position = "afterend",
        selector = ".midi-dnd5e-buttons"
    })
    {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = message.content

        const target = wrapper.querySelector(selector)

        if (!target) return

        const partHTML = await resolvePartHtml({
            html,
            template,
            templateData
        })
        if (!partHTML) return

        target.insertAdjacentHTML(position, partHTML)

        await message.update({
            content: wrapper.innerHTML
        })
    }

    static async replace({
        message,
        selector,
        html,
        template,
        templateData
    })
    {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = message.content

        const target = wrapper.querySelector(selector)
        if (!target) return

        const partHTML = await resolvePartHtml({
            html,
            template,
            templateData
        })
        if (!partHTML) return

        target.outerHTML = partHTML

        await message.update({
            content: wrapper.innerHTML
        })
    }

    static async remove({
        message,
        selector
    })
    {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = message.content

        wrapper.querySelector(selector)?.remove()

        await message.update({
            content: wrapper.innerHTML
        })
    }

    static async replaceCard({
        message,
        html,
        template,
        templateData
    })
    {
        await this.replace({
            message,
            selector: CARD_SELECTOR,
            html,
            template,
            templateData
        })
    }
}

const CARD_SELECTOR = "[data-transformations-card], .gift-of-damnation-card"

async function resolvePartHtml({
    html,
    template,
    templateData
} = {})
{
    if (typeof html === "string") {
        return html
    }

    if (!template) return ""

    return foundry.applications.handlebars.renderTemplate(template, templateData)
}
