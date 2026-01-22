import { RollSource } from "./RollSource.js";

export class EffectMetaDataSource extends RollSource {
    constructor({ rollFormula = "1d20" } = {}) {
        super();
        this.rollFormula = rollFormula;
    }

    async roll(actor) {
        const roll = await new Roll(this.rollFormula).evaluate({ async: true });

        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor })
        });

        return {
            roll,
            total: roll.total
        };
    }
}
