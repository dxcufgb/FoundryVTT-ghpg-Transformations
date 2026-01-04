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

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".choice-card-button").on("contextmenu", ev => {
            ev.preventDefault();
            const tooltip = ev.currentTarget.querySelector(".context-tooltip");
            html.find(".context-tooltip").hide();
            tooltip.style.display = "block";
        });

        html.on("click", () => {
            html.find(".context-tooltip").hide();
        });
    }

    static PARTS = {
        content: {
            template: "modules/transformations/scripts/templates/choiceDialog.hbs"
        }
    };

    async _prepareContext() {
        if (!this.choices) throw new Error("Invalid choices");
        const valueMap = [];
        for (const choice of this.choices) {
            valueMap.push({
                id: choice._id,
                icon: choice.img,
                name: choice.name,
                details: choice.system.description.value,
            });
        }

        return {
            title: "Tranformation Stage Choices",
            choices: valueMap ?? [],
        };
    }

    static async _onSave(event, target) {
        const app = this;
        const formData = new FormData(target.form);
        app.close();
    }
}
