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

        const partHTML = await foundry.applications.handlebars.renderTemplate(template, templateData)

        target.insertAdjacentHTML(position, partHTML)

        await message.update({
            content: wrapper.innerHTML
        })
    }

    static async replace({
        message,
        selector,
        template,
        templateData
    })
    {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = message.content

        const target = wrapper.querySelector(selector)
        if (!target) return

        const partHTML = await foundry.applications.handlebars.renderTemplate(template, templateData)

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
        template,
        templateData
    })
    {
        await this.replace({
            message,
            selector: "[data-transformations-card]",
            template,
            templateData
        })
    }
}