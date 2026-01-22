export class TransformationChoiceDialog extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
    constructor({ choices, onResolve }, options = {}) {
        super(options);
        this.choices = choices;
        this.onResolve = onResolve;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "transformation-choice-dialog",
            template:
                "modules/transformations/scripts/templates/dialogs/transformation-choice.hbs",
            width: 400
        });
    }

    getData() {
        return {
            choices: this.choices
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("[data-choice]").on("click", ev => {
            const choice = ev.currentTarget.dataset.choice;
            this.onResolve(choice);
            this.close();
        });
    }
}