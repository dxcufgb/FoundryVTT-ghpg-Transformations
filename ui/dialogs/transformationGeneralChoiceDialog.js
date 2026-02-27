export class TransformationGeneralChoiceDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor ({ actor, viewModel, controller, options = {}, logger = null })
    {
        logger?.debug?.("TransformationGeneralChoiceDialog.constructor", {
            actor,
            viewModel,
            controller,
            options
        })

        super({
            ...options,
            window: {
                title: viewModel.title
            }
        })

        this.actor = actor
        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form", "transformation-general-choice-dialog"],
        window: {
            resizable: false
        }
    }

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-general-choice.hbs"
        }
    }

    async _prepareContext()
    {
        this.logger?.debug?.("TransformationGeneralChoiceDialog._prepareContext")
        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("TransformationGeneralChoiceDialog._onRender", { context, options })
        super._onRender(context, options)

        const root = this.element
        if (!root) return

        const buttons = document.querySelectorAll('.choice-button')

        buttons.forEach(button =>
        {
            button.addEventListener('click', async () =>
            {
                await this.controller.choose(button.dataset.choiceId)
                this.close()
            })
        })
    }

    async _onClose(options)
    {
        this.logger?.debug?.("TransformationGeneralChoiceDialog._onClose", { options })
        await super._onClose(options)
        this.controller.cancel?.()
    }
}
