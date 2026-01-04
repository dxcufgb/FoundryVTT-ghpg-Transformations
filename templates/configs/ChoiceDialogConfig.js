export class ChoiceDialogConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "choice-config",
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form"],
        window: {
            title: "Transformation Stage Choice",
            width: 600,
            resizable: false
        },
        actions: {
            save: ChoiceDialogConfig._onSave
        }
    };

    constructor(choices, options = {}) {
        super(options);
        this.choices = choices;
    }

    get isEditable() {
        return this.actor.isOwner || game.user.isGM;
    }

    static PARTS = {
        content: {
            template: "modules/transformations/scripts/Templates/choiceDialog.hbs"
        }
    };

    async _prepareContext() {
        if (!this.choices) throw new Error("Invalid choices");
        const valueMap = [];
        for (const choice of this.choices) {
            valueMap.push({
                icon: choice.img,
                name: choice.name,
                hint: choice.system.description.value,
            });
        }

        const rows = Math.ceil((this.choices.length + 1) / 2);

        return {
           choices: valueMap  ?? [],
           rows: rows ?? 1,
        };
    }

    static async _onSave(event, target) {
        const app = this;
        const formData = new FormData(target.form);
        app.close();
    }
}
