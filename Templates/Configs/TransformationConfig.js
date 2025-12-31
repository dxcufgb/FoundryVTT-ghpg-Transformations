export class TransformationConfig extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
  ) {
    static DEFAULT_OPTIONS = {
        id: "transformation-config",
        tag: "form",
        window: {
            title: "Transformation",
            width: 420,
            resizable: false
        },
        actions: {
            save: TransformationConfig._onSave
        }
    };

    constructor(actor, pack, options = {}) {
        super(options);
        this.actor = actor;
        this.pack = pack;
    }

    get isEditable() {
        return this.actor.isOwner || game.user.isGM;
    }

    static PARTS = {
        content: {
            template: "modules/my-module/templates/transformation-config.hbs"
        }
    };

    async _prepareContext() {
        if (!this.pack) throw new Error("Invalid compendium pack");
        const selectedUUID = this.actor.getFlag("dnd5e", "transformation")

        return {
            editable: this.isEditable,
            transformations: this.pack.index.map(e => ({
                uuid: e.uuid,
                name: e.name,
                img: e.img,
                selected: e.uuid === selectedUUID
            }))
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
