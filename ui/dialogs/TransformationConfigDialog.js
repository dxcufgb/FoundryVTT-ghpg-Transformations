export class TransformationConfigDialog
    extends foundry.applications.api.HandlebarsApplicationMixin(
        foundry.applications.api.ApplicationV2
    ) {

    static DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        id: "transformation-config",
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form"],
        window: {
            title: "Transformation",
            resizable: false
        },
        actions: {
            save: TransformationConfigDialog._onSave
        }
    };

    static PARTS = {
        ...super.PARTS,
        content: {
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-config.hbs"
        }
    };

    constructor({
        actorId,
        viewModel,
        controller,
        logger
    }) {
        super();

        this.actorId = actorId;
        this.viewModel = viewModel;
        this.controller = controller;
        this.logger = logger;
    }

    async _prepareContext() {
        return this.viewModel;
    }

    static async _onSave(event, target) {
        return this._handleSave(event, target);
    }

    async _handleSave(event, target) {
        event.preventDefault();

        const formData = new FormData(target.form);
        const selectedId = formData.get("transformation");

        this.logger.debug(
            "TransformationConfigDialog save",
            this.actorId,
            selectedId
        );

        await this.controller.applySelection({
            actorId: this.actorId,
            transformationId: selectedId
        });

        this.close();
    }
}
