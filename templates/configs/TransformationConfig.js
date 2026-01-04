export class TransformationConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "transformation-config",
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form"],
        window: {
            title: "Transformation",
            width: "720px",
            resizable: false
        },
        actions: {
            save: TransformationConfig._onSave,
            stageUp: TransformationConfig._onStageUp
        }
    };

    constructor(actor, transformations, options = {}) {
        super(options);
        this.actor = actor;
        this.transformations = transformations;
        this._initialStage = actor.getFlag("dnd5e", "transformationStage") ?? null;
        this._initialTransformation = actor.getFlag("dnd5e", "transformations") ?? null;
    }

    get isEditable() {
        if (game.user.isGM) {
            return true;
        } else if (this.actor.isOwner) {
            if (this._initialTransformation == null) {
                return true;
            } else if (this._initialStage < 4) {
                return true;
            } else {
                return false;
            }
        }
    }

    static PARTS = {
        content: {
            template: "modules/transformations/scripts/templates/transformationConfig.hbs"
        }
    };

    async _prepareContext() {
        if (!this.transformations) throw new Error("Invalid transformations");
        const selectedId = this.actor.getFlag("dnd5e", "transformations");
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
            editable: (this._initialTransformation != null),
            canLevelUpStage: (this._initialStage < 4),
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
        const id = formData.get("transformation");
        if (app.actor.getFlag("dnd5e", "transformations") == null){
            await app.actor.setFlag("dnd5e", "transformations", id, { transformationsInternal: true });
        }
        app.close();
    }

    static async _onStageUp(event, target) {
        const app = this;
        if (!app.isEditable) return;
        const formData = new FormData(target.form);
        if (app._initialStage < 4) {
            await app.actor.setFlag("dnd5e", "transformationStage", app._initialStage+1, { transformationsInternal: true });
        }
        app.close();
    }
}
