export class TransformationConfig extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
  ) {
    static DEFAULT_OPTIONS = {
        id: "transformation-config",
        tag: "form",
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
        const selectedUUID = this.actor.getFlag("dnd5e", "transformation")

        return {
            editable: this.isEditable,
            transformations: this.transformations.forEach(transformation => {
                const returnObject= {
                    uuid: transformation.uuid,
                    name: transformation.name,
                    img: transformation.img,
                    selected: transformation.uuid === selectedUUID
                }
            })
        };
    }

    static async _onSave(event, target) {
        const app = this;
        if (!app.isEditable) return;

        const formData = new FormData(target.form);
        const uuid = formData.get("transformation");

        await app.actor.setFlag("dnd5e", "transformation", uuid);
        app.close();
    }
}
