// fey-exhaustion-recovery-dialog.js
export class FeyExhaustionRecoveryDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor ({ viewModel, controller, options = {}, logger = null })
    {
        logger?.debug?.("FeyExhaustionRecoveryDialog.constructor", {
            viewModel,
            controller,
            options
        })

        super(options)

        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        classes: ["sheet", "dnd5e2", "standard-form", "fey-exhaustion-dialog"],
        window: {
            title: "Fey Exhaustion Recovery",
            width: 420,
            height: "auto",
            resizable: false
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/fey-exhaustion-recovery-dialog.hbs"
        }
    };

    async _prepareContext()
    {
        this.logger?.debug?.("FeyExhaustionRecoveryDialog._prepareContext")
        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("FeyExhaustionRecoveryDialog._onRender", {
            context,
            options
        })

        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const select = root.querySelector("[data-action='amount']")
        const confirmBtn = root.querySelector("[data-action='confirm']")

        confirmBtn?.addEventListener("click", async () =>
        {
            const value = Number(select?.value ?? 0)
            if (!value) return

            await this.controller.confirm(value)
            this.close()
        })
    }

    async _onClose(options)
    {
        this.logger?.debug?.("FeyExhaustionRecoveryDialog._onClose", {
            options
        })

        await super._onClose(options)
        this.controller.cancel?.()
    }
}