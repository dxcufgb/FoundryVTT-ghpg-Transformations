export class TransformationStageConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(actor) {
        super();
        this.actor = actor;
    }

    async _prepareContext() {
        return {
            flags: this.actor.flags.dnd5e.transformationStage ?? {}
        };
    }

    static DEFAULT_OPTIONS = {
        id: "my-pill-config",
        tag: "form",
        classes: ["dnd5e", "sheet", "transformation", "transformation-stage-config"],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        window: {
            title: "Transformation Stage",
            resizable: false
        },
        position: {
            width: 300,
            height: "auto"
        }
    };

    async _onSave(event, formData) {
        await this.actor.update(formData);
        const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(app.actor);
        transformation.onTransformationUpdate();
    }
}