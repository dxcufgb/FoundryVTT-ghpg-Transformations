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
            select: ChoiceDialogConfig._onSelect,
        }
    };

    constructor(choices, { resolve } = {}) {
        super();
        this.choices = choices;
        this._resolve = resolve;
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
            choices: valueMap ?? [],
        };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        const html = this.element;

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

    static _onSelect(event, target) {
        const app = this;

        const choiceId = target.dataset.choiceId;
        const choiceName = target.dataset.choiceName;

        if (app._resolve) {
            app._resolve({ id: choiceId, name: choiceName });
        }

        app.close();
    }

}
