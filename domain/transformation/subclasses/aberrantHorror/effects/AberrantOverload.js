import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantOverload extends AberrantEffect {
    static meta = {
        rollRanges: {
            4: [1, 2]
        }
    }

    constructor(args) {
        super(args);
        this.description =
            "The stress of your Transformation becomes too much. You die. You cannot be restored to life by any spell below level 5";
    }

    async beforeApply() {
        await this.actor.update({
            "system.attributes.hp.temp": 0,
            "system.attributes.hp.value": 0,
            "system.attributes.death.failure": 3
        });

        TransformationModule.dialogs
            .getSimpleDialog(this.name, this.description)
            .render(true);

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: this.description
        });

        this.runActiveEffect = false;
    }
}