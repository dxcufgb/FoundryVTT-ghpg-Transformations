export class RollTableEffectCatalog {
    #effects = [];

    constructor({ effects = [], logger } = {}) {
        this.#effects = effects;
        this.logger = logger;
    }

    getAll() {
        return [...this.#effects];
    }

}
