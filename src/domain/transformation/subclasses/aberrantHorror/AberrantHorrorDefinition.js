import { TransformationDefinition } from "../../TransformationDefinition.js";
import { aberrantHorrorStages } from "./stages/aberrantHorrorStages.js"
import { aberrantHorrorTriggers } from "./triggers/aberrantHorrorTriggers.js"

export class AberrantHorrorDefinition extends TransformationDefinition {

    constructor({ uuid, item }) {
        super({
            id: "aberrant-horror",
            label: "Aberrant Horror",
            uuid,
            item
        });


        this.#defineStages();
        this.#defineTriggers();

        this.validate();
    }

    #defineStages() {
        this.stages = aberrantHorrorStages;
    }

    #defineTriggers() {
        this.triggers = aberrantHorrorTriggers;
    }
}