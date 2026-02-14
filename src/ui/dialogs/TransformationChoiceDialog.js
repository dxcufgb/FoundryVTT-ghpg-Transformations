export class TransformationChoiceDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    ) {

    constructor ({ actor, viewModel, controller, options = {} })
    {
        super(options)
        this.actor = actor
        this.viewModel = viewModel
        this.controller = controller
    }

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form", "transformation-choice-dialog"],
        window: {
            title: "Transformation Stage Choice",
            width: 600,
            height: 450,
            resizable: false
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-choice.hbs"
        }
    };

    async _prepareContext()
    {
        return this.viewModel
    }

    _onRender(context, options)
    {
        super._onRender(context, options)

        const root = this.element
        if (!root) return

        // Radio selection
        root.querySelectorAll("input[name='choice']").forEach(input =>
        {
            input.addEventListener("change", ev =>
            {
                this.radioButtonListener(ev, root)
            })

            input.addEventListener("click", ev =>
            {
                this.radioButtonListener(ev, root)
            })
        })

        // Confirm button
        root.querySelector("[data-action='choose']")
            ?.addEventListener("click", async () =>
            {
                const btn = root.querySelector(".choice-confirm")
                const uuid = btn?.dataset.uuid
                if (!uuid) return

                await this.controller.choose(uuid)
                this.close()
            })
    }

    async _onClose(options)
    {
        await super._onClose(options)
        this.controller.cancel()
    }

    radioButtonListener(ev, root)
    {
        const uuid = ev.currentTarget.dataset.uuid

        root.querySelectorAll(".choice-description").forEach(el =>
        {
            el.hidden = el.dataset.choiceUuid !== uuid
        })

        const btn = root.querySelector(".choice-confirm")
        btn.dataset.uuid = uuid
        btn.disabled = false

        root.querySelector(".choice-description-container").hidden = false
        root.querySelector(".choice-footer").hidden = false

        this.setPosition({ left: null, top: null })
    }
}