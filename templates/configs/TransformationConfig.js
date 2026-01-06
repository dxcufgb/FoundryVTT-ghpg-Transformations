import { WithThreeDotMenu } from "../mixins/WithThreeDotMenu.js";

export class TransformationConfig extends WithThreeDotMenu(foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)) {
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
            save: TransformationConfig._onSave,
            stageUp: TransformationConfig._onStageUp,
            resetCurrentTransformation: TransformationConfig._resetCurrentTransformation,
            removeTransformation: TransformationConfig._removeCurrentTransformation
        }
    };

    static get threeDotConfig() {
        return {
            selector: ".header-control.fa-ellipsis-vertical.hidden",
            gmOnly: true
        };
    }

    constructor(actor, transformations, options = {}) {
        super(options);
        this.actor = actor;
        this.transformations = transformations;
        this._initialStage = actor.getFlag("dnd5e", "transformationStage") ?? null;
        this._initialTransformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(this.actor);
    }

    get isEditable() {
        if (this.actor.isOwner || game.user.isGM) {
            if (this._initialTransformation == null) {
                return true;
            } else if (this._initialStage < 4) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    static PARTS = {
        ...super.PARTS,
        content: {
            template: "modules/transformations/scripts/templates/transformationConfig.hbs"
        }
    };

    getContextMenuOptions() {
        return [
            {
                name: "Reset Transformation",
                icon: '<i class="fas fa-rotate-left"></i>',
                condition: () => game.user.isGM,
                callback: () =>
                    TransformationConfig._resetCurrentTransformation.call(this)
            },
            {
                name: "Remove Transformation",
                icon: '<i class="fas fa-trash"></i>',
                condition: () => game.user.isGM,
                callback: () =>
                    TransformationConfig._removeCurrentTransformation.call(this)
            }
        ];
    }

    async _prepareContext() {
        super._prepareContext();
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
        let selectedTransformationName;
        if (this._initialTransformation.name != "Transformation") {
            selectedTransformationName = this._initialTransformation.name;
        } else {
            selectedTransformationName = "";
        }

        return {
            editable: this.isEditable,
            canLevelUpStage: (this._initialStage < 4 && this._initialTransformation.name != "Transformation"),
            transformations: valueMap ?? [],
            transformationStage: actorTransformationStage ?? 0,
            rows: rows ?? 1,
            noneSelected: !selectedId,
            transformationStages: CONFIG.DND5E.characterFlags.transformationStage ?? 1,
            selectedTransformationName: selectedTransformationName
        };
    }

    static async _onSave(event, target) {
        const app = this;
        if (!app.isEditable) return;
        const formData = new FormData(target.form);
        const id = formData.get("transformation");
        if (app.actor.getFlag("dnd5e", "transformations") == null || game.user.isGM) {
            await app.actor.setFlag("dnd5e", "transformations", id);
            await app.actor.setFlag(TransformationModule.constants.MODULE_NAME, "transformations", "transformationStage", 1);
        }
        app.close();
    }

    static async _onStageUp(event, target) {
        const app = this;
        if (!app.isEditable) return;
        if (app._initialStage < 4) {
            await app.actor.setFlag("dnd5e", "transformationStage", app._initialStage + 1);
        }
        app.close();
    }

    static async _resetCurrentTransformation(event, target) {
        const app = this;
        if (!game.user.isGM) return;
        for (let stage = 1; stage <= 4; stage++) {
            await app.actor.unsetFlag(TransformationModule.constants.MODULE_NAME, `stage-${stage}-choice`);
        }
        await app.actor.setFlag("dnd5e", "transformationStage", 1);
        this._initialStage = 1;
        app.render(true);
    }

    static async _removeCurrentTransformation(event, target) {
        const app = this;
        if (!game.user.isGM) return;
        for (let stage = 1; stage <= 4; stage++) {
            await app.actor.unsetFlag(TransformationModule.constants.MODULE_NAME, `stage-${stage}-choice`);
        }
        await app.actor.setFlag("dnd5e", "transformationStage", 1);
        await app.actor.unsetFlag("dnd5e", "transformations");
        this._initialStage = 1;
        this._initialTransformation = null;
        app.close();
    }
}
