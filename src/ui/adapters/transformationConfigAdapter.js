export function registerTransformationConfigAdapter({
    app,
    html,
    dialogFactory,
    transformations
})
{
    html.addEventListener("click", event =>
    {
        const button = event.target.closest("[data-action]")
        if (!button) return

        const { action, config } = button.dataset

        if (action !== "showConfiguration") return
        if (config !== "transformation") return
        if (!app.isEditable) return

        dialogFactory.openTransformationConfig({
            actor: app.actor,
            transformations,
            parent: app
        })
    })
}