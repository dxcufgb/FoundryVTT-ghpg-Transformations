export class TransformationConfigDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    ) {

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form", "transformation-config"],
        window: {
            title: "Transformation",
            resizable: false
        },
        actions: {
            save: async function(event, target)
            {
                return this.onSave(event, target)
            }
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-config.hbs"
        }
    };

    constructor ({
        actorUuid,
        viewModel,
        controller,
        options,
        logger
    })
    {
        logger?.debug?.("TransformationConfigDialog.constructor", {
            actorUuid,
            viewModel,
            controller,
            options
        })
        super(options)
        logger?.debug?.("TransformationConfigDialog constructed", {
            actorUuid,
            dialog: this
        })
        this.actorUuid = actorUuid
        this.viewModel = viewModel
        this.controller = controller
        this.logger = logger
    }

    async _prepareContext()
    {
        this.logger?.debug?.("TransformationConfigDialog._prepareContext", {})
        return this.viewModel
    }

    async onSave(event, target)
    {
        this.logger?.debug?.("TransformationConfigDialog.onSave", { event, target })
        event.preventDefault()

        const formData = new FormData(target.form)
        const selectedId = formData.get("transformation")

        this.logger.debug(
            "TransformationConfigDialog save",
            this.actorUuid,
            selectedId
        )

        await this.controller.applySelection({
            actorUuid: this.actorUuid,
            transformationId: selectedId
        })

        await this.close({ force: true })
    }
}
