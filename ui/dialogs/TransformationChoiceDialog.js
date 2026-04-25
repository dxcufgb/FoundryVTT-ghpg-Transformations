export class TransformationChoiceDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    )
{
    constructor ({ actor, viewModel, controller, options = {}, logger = null })
    {
        logger?.debug?.("TransformationChoiceDialog.constructor", {
            actor,
            viewModel,
            controller,
            options
        })
        super(options)
        this.actor = actor
        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
        this.selectedChoiceUuids = new Set(
            (viewModel?.choices ?? [])
            .filter(choice => choice.checked)
            .map(choice => choice.uuid)
        )
        this.activeChoiceUuid =
            (viewModel?.choices ?? []).find(choice => choice.checked)?.uuid ??
            null
        this.didResolve = false
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        tag: "form",
        classes: [
            "sheet",
            "dnd5e2",
            "standard-form",
            "transformation-choice-dialog"
        ],
        window: {
            title: "Transformation Stage Choice",
            width: 600,
            height: 450,
            resizable: false
        }
    }

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-choice.hbs"
        }
    }

    async _prepareContext()
    {
        this.logger?.debug?.("TransformationChoiceDialog._prepareContext", {})
        return this.viewModel
    }

    _onRender(context, options)
    {
        this.logger?.debug?.("TransformationChoiceDialog._onRender", {
            context,
            options
        })
        super._onRender(context, options)

        const root = this.element
        if (!root) return

        root.querySelectorAll("input[name='choice']").forEach(input =>
        {
            input.addEventListener("change", ev =>
            {
                this.selectionListener(ev, root)
            })
        })

        this.updateSelectionUi(root)

        root.querySelector("[data-action='choose']")
            ?.addEventListener("click", async ev =>
            {
                ev.preventDefault()

                const choiceCount = this.viewModel?.choiceCount ?? 1
                const selectedChoiceUuids = [...this.selectedChoiceUuids]

                if (choiceCount <= 1 && !selectedChoiceUuids[0]) {
                    return
                }

                if (
                    choiceCount > 1 &&
                    selectedChoiceUuids.length !== choiceCount
                ) {
                    return
                }

                this.didResolve = true
                await this.controller.choose(
                    choiceCount > 1
                        ? selectedChoiceUuids
                        : selectedChoiceUuids[0]
                )
                await this.close({ force: true })
            })
    }

    async _onClose(options)
    {
        this.logger?.debug?.("TransformationChoiceDialog._onClose", {
            options
        })
        await super._onClose(options)

        if (!this.didResolve) {
            this.controller.cancel()
        }
    }

    selectionListener(ev, root)
    {
        this.logger?.debug?.(
            "TransformationChoiceDialog.selectionListener",
            { ev, root }
        )
        const input = ev.currentTarget
        const uuid = input?.dataset?.uuid
        const choiceCount = this.viewModel?.choiceCount ?? 1

        if (!uuid) return

        if (choiceCount <= 1) {
            this.selectedChoiceUuids.clear()
            if (input.checked) {
                this.selectedChoiceUuids.add(uuid)
            }
        } else if (input.checked) {
            this.selectedChoiceUuids.add(uuid)
        } else {
            this.selectedChoiceUuids.delete(uuid)
        }

        this.activeChoiceUuid = uuid
        this.updateSelectionUi(root)
        this.setPosition({ left: null, top: null })
    }

    updateSelectionUi(root)
    {
        const choiceCount = this.viewModel?.choiceCount ?? 1
        const selectedCount = this.selectedChoiceUuids.size
        const hasSelection = selectedCount > 0
        const maxSelected = selectedCount >= choiceCount

        root.querySelectorAll("input[name='choice']").forEach(input =>
        {
            const isSelected = this.selectedChoiceUuids.has(input.dataset.uuid)

            input.checked = isSelected
            input.disabled = choiceCount > 1 && !isSelected && maxSelected
        })

        root.querySelectorAll(".choice-description").forEach(element =>
        {
            element.hidden =
                element.dataset.choiceUuid !== this.activeChoiceUuid
        })

        const confirmButton = root.querySelector(".choice-confirm")
        if (confirmButton) {
            confirmButton.disabled = choiceCount > 1
                ? selectedCount !== choiceCount
                : selectedCount !== 1
            confirmButton.dataset.uuid = [...this.selectedChoiceUuids][0] ?? ""
        }

        root.querySelector("[data-choice-counter-value]")?.replaceChildren(
            document.createTextNode(
                String(Math.max(choiceCount - selectedCount, 0))
            )
        )

        const descriptionContainer = root.querySelector(
            ".choice-description-container"
        )
        if (descriptionContainer) {
            descriptionContainer.hidden = !this.activeChoiceUuid
        }

        const footer = root.querySelector(".choice-footer")
        if (footer) {
            footer.hidden = !hasSelection
        }
    }
}
