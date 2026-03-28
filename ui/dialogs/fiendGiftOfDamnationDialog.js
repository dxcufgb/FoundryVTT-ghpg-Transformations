export class FiendGiftOfDamnationDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: ["sheet", "dnd5e2", "standard-form", "fiend-gifts-dialog"],
        window: {
            title: "Gifts of Damnation",
            width: 460,
            height: "auto",
            resizable: false
        }
    };
    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/fiend-gift-of-damnation-dialog.hbs"
        }
    };

    constructor({viewModel, controller, options = {}, logger = null})
    {
        logger?.debug?.("FiendGiftOfDamnationDialog.constructor", {
            viewModel,
            controller,
            options
        })

        super(options)

        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    async _prepareContext()
    {
        this.logger?.debug?.("FiendGiftOfDamnationDialog._prepareContext")
        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("FiendGiftOfDamnationDialog._onRender", {
            context,
            options
        })

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const select = root.querySelector("[data-action='gift']")
        const confirmBtn = root.querySelector("[data-action='confirm']")

        confirmBtn?.addEventListener("click", async () =>
        {
            const value = select?.value ?? ""
            if (!value) return

            await this.controller.confirm(value)
            this.close()
        })
        select.addEventListener("change", () => {
            this.updateDescription(root, select)
        })

        this.updateDescription(root, select)
    }

    async _onClose(options)
    {
        this.logger?.debug?.("FiendGiftOfDamnationDialog._onClose", {
            options
        })

        await super._onClose(options)
        this.controller.cancel?.()
    }

    updateDescription(root, select) {
        const value = select.value
        const descriptions = root.querySelectorAll('.fiend-gift-description')

        descriptions.forEach(desc => {
            desc.hidden = desc.dataset.giftValue !== value
        });
    }

}
