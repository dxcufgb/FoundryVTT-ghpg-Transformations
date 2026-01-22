export class EffectResolver {
    constructor({ effects, stageResolver }) {
        this.effects = effects;
        this.stageResolver = stageResolver;
    }

    resolve(actor, rollValue) {
        const stage = this.stageResolver(actor);

        return Object.values(this.effects).find(EffectClass => {
            const ranges = EffectClass.meta?.rollRanges;
            if (!ranges?.[stage]) return false;

            const [min, max] = ranges[stage];
            return rollValue >= min && rollValue <= max;
        });
    }
}
