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
        this.selectedChoiceIds = new Set()
        this.didResolve = false
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form", "transformation-general-choice-dialog"],
        window: {
            resizable: false,
            closeOnSubmit: true
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

        const buttons = root.querySelectorAll(".choice-button")
        const choiceCount = this.viewModel.choiceCount ?? 1
        const isMultiChoice = choiceCount > 1

        this.updateSelectionUi(root)

        buttons.forEach(button =>
        {
            button.addEventListener("click", async () =>
            {
                if (!isMultiChoice) {
                    this.didResolve = true
                    await this.controller.choose(button.dataset.choiceId)
                    await this.close({ force: true })
                    return
                }

                this.toggleChoice(button.dataset.choiceId)
                this.updateSelectionUi(root)
            })
        })

        if (isMultiChoice) {
            root.querySelector("[data-action='choose']")
                ?.addEventListener("click", async () =>
                {
                    if (this.selectedChoiceIds.size !== choiceCount) return

                    this.didResolve = true
                    await this.controller.choose([...this.selectedChoiceIds])
                    await this.close({ force: true })
                })
        }
    }

    async _onClose(options)
    {
        this.logger?.debug?.("TransformationGeneralChoiceDialog._onClose", { options })
        await super._onClose(options)
        if (!this.didResolve) {
            this.controller.cancel?.()
        }
    }

    toggleChoice(choiceId)
    {
        if (!choiceId) return

        if (this.selectedChoiceIds.has(choiceId)) {
            this.selectedChoiceIds.delete(choiceId)
            return
        }

        if (this.selectedChoiceIds.size >= (this.viewModel.choiceCount ?? 1)) {
            return
        }

        this.selectedChoiceIds.add(choiceId)
    }

    updateSelectionUi(root)
    {
        const choiceCount = this.viewModel.choiceCount ?? 1
        const selectedCount = this.selectedChoiceIds.size
        const maxSelected = selectedCount >= choiceCount

        root.querySelectorAll(".choice-button").forEach(button =>
        {
            const isSelected = this.selectedChoiceIds.has(button.dataset.choiceId)
            button.dataset.selected = isSelected ? "true" : "false"
            button.classList.toggle("is-selected", isSelected)
            button.setAttribute("aria-pressed", isSelected ? "true" : "false")
            button.disabled = !isSelected && maxSelected
        })

        root.querySelector("[data-choice-counter-value]")?.replaceChildren(
            document.createTextNode(String(Math.max(choiceCount - selectedCount, 0)))
        )

        const confirmButton = root.querySelector("[data-action='choose']")
        if (confirmButton) {
            confirmButton.disabled = selectedCount !== choiceCount
        }
    }
}
