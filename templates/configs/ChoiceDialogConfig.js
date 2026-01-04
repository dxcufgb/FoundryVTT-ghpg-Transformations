export class ChoiceDialogConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "choice-config",
        tag: "form",
        classes: ["sheet", "dnd5e2", "standard-form"],
        window: {
            title: "Transformation Stage Choice",
            width: "600px",
            height: "450px",
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
                uuid: choice.uuid,
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
        this.element.addEventListener("click", (event) => {
            this._onClick(event);
        });
    }

    _onClick(event) {
        const target = event.target;

        if (target instanceof HTMLInputElement && target.type === "radio") {
            const id = target.dataset.id;

            TransformationModule.logger.warn(this.element)
            TransformationModule.logger.warn(this.element.querySelectorAll(".choice-description"));
            TransformationModule.logger.warn(this.element.querySelectorAll(".choice-description").forEach(el => { el.dataset.choiceId }))

            this.element
            .querySelectorAll(".choice-description")
            .forEach(el => {
                el.hidden = el.dataset.choiceId !== id;
            });
        }

        const button = target.closest("[data-action='choose']");
        if (button) {
            const selected = this.element.querySelector("input[name='choice']:checked");
            if (!selected) return;

            console.log("Chosen:", selected.dataset);
            this.close();
        }
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
