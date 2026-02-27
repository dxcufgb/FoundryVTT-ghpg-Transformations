// item-info-dialog.js
export class ItemInfoDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor ({ item, viewModel, controller, options = {}, logger = null })
    {
        logger?.debug?.("ItemInfoDialog.constructor", {
            item,
            viewModel,
            controller,
            options
        })

        super(options)

        this.item = item
        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: ["sheet", "dnd5e2", "standard-form", "item-info-dialog"],
        window: {
            title: "Item Information",
            width: 420,
            height: "auto",
            resizable: false
        }
    }

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/item-info-dialog.hbs"
        }
    }

    async _prepareContext()
    {
        this.logger?.debug?.("ItemInfoDialog._prepareContext")
        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("ItemInfoDialog._onRender", { context, options })
        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const button = root.querySelector("[data-action='continue']")

        button?.addEventListener("click", async () =>
        {
            await this.controller.continue()
            this.close()
        })
    }

    async _onClose(options)
    {
        this.logger?.debug?.("ItemInfoDialog._onClose", { options })
        await super._onClose(options)
        this.controller.cancel?.()
    }
}