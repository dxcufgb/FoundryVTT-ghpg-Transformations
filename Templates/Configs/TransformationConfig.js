export class TransformationConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "transformation-config",
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form"],
        window: {
            title: "Transformation",
            width: 600,
            resizable: false
        },
        actions: {
            save: TransformationConfig._onSave
        }
    };

    constructor(actor, transformations, options = {}) {
        super(options);
        this.actor = actor;
        this.transformations = transformations;
        this._initialStage = actor.getFlag("dnd5e", "transformationStage") ?? null;
        this._initialTransformation = actor.getFlag("dnd5e", "transformation") ?? null;
    }

    get isEditable() {
        return this.actor.isOwner || game.user.isGM;
    }

    static PARTS = {
        content: {
            template: "modules/transformations/scripts/Templates/transformationConfig.hbs"
        }
    };

    async _prepareContext() {
        if (!this.transformations) throw new Error("Invalid transformations");
        const selectedId = this.actor.getFlag("dnd5e", "transformation");
        const actorTransformationStage = this.actor.getFlag("dnd5e", "transformationStage");
        const valueMap = [];
        for (const transformation of TransformationModule.Transformations.values()) {
            valueMap.push({
                id: transformation.itemId,
                name: transformation.name,
                img: transformation.img,
                selected: transformation.itemId === selectedId
            });
        }

        const rows = Math.ceil((TransformationModule.Transformations.length + 1) / 2);

        return {
            editable: this.isEditable,
            transformations: valueMap  ?? [],
            transformationStage: actorTransformationStage ?? 0,
            rows: rows ?? 1,
            noneSelected: !selectedId,
            transformationStages: CONFIG.DND5E.characterFlags.transformationStage ?? {}
        };
    }

    static async _onSave(event, target) {
        const app = this;
        if (!app.isEditable) return;

        const formData = new FormData(target.form);
        TransformationModule.logger.debug("formData: ", formData);
        const id = formData.get("transformation");
        TransformationModule.logger.debug("Selected transformation id: ", id);

        if (id !== app._initialTransformation) {
            if (id && id !== "None") {
                await app.actor.setFlag("dnd5e", "transformation", id, { transformationsInternal: true });
            } else {
                await app.actor.unsetFlag("dnd5e", "transformation" , { transformationsInternal: true });
            }
        }
        if (formData.get("transformationStage") != app._initialStage) {
            await app.actor.setFlag("dnd5e", "transformationStage", formData.get("transformationStage"), { transformationsInternal: true });
        }
        app.close();
    }
}
