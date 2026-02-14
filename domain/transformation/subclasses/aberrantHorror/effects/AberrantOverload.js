import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantOverload extends AberrantEffect {
    static meta = {
        rollRanges: {
            4: [1, 2]
        }
    }

    constructor(args) {
        args?.logger?.debug?.("AberrantOverload.constructor", { args })
        super(args);
        this.description =
            "The stress of your Transformation becomes too much. You die. You cannot be restored to life by any spell below level 5";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantOverload.beforeApply", {})
        await this.actorRepository.setActorHp(actor, 0, "value");
        await this.actorRepository.setActorHp(actor, 0, "temp");
        await this.actorRepository.setActorDeathSaves(this.actor, 3, "failures");

        this.runActiveEffect = false;
    }

    async afterApply() {
        this.logger?.debug?.("AberrantOverload.afterApply", {})
        await this.postChat({
            content: this.description
        });
    }
}

