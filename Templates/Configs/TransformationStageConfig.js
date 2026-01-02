export class TransformationStageConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor(actor) {
        super();
        this.actor = actor;
    }

    static DEFAULT_OPTIONS = {
        id: "my-pill-config",
        tag: "form",
        classes: ["dnd5e", "sheet", "transformation", "transformation-stage-config"],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    async _onChange(event, formData) {
        await this.actor.update(formData);
        const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(this.actor);
        transformation.onTransformationUpdate();
    }
}