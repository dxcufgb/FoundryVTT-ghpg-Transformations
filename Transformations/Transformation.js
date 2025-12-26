export class Transformation {

    id;
    name;
    tablePrefix;
    transformationLevelKey;
    transformationLevel = 0;
    initialized = false;
    actor;
    rollTableEffectFunction;

    constructor(actor) {
        this.actor = actor;
        this.id = this.constructor.id
        this.name = this.constructor.name
        this.tablePrefix = this.constructor.tablePrefix
        this.rollTableEffectFunction = this.constructor.rollTableEffectFunction
        this.transformationLevelKey = this.constructor.transformationLevelKey
    }

    getTransformationType(actor) {
        let transformation
        if (!actor) {
            console.log("No actor was supplied.");
            return
        } else if (!actor.items) {
            console.log(`${actor} has no items.`)
            return
        } else {
            TransformationModule.Transformations.forEach(transformationSubClass => {
                if (actor.items.find(obj => obj.identifier === transformationSubClass.id)) {
                    transformation = new transformationSubClass(actor);
                }
            });
            return transformation;
        }
    }

    onDamage() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onShortRest(result) {
        console.error("should be implemented AND called at sub-class level!");
    }

    onLongRest(result) {
        console.error("should be implemented AND called at sub-class level!");
    }

    onInitiative() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onConcentration() {
        console.error("should be implemented AND called at sub-class level!");
    }
    
    onHitDieRoll(context) {
        console.error("should be implemented AND called at sub-class level!");
    }

    onBloodied() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onUnconscious(){
        console.error("should be implemented AND called at sub-class level!");
    }

    async rollResultFromRollTable() {
        await this.removeActiveTransformationEffect();
        const drawResult = await this.drawTableResult();
        console.log(drawResult);
        await this.applyRollTableResult(drawResult.results[0].name);
    }

    getRollTableName() {
        return (this.tablePrefix + " Stage " + this.transformationLevel)
    }

    getActorTransformationLevel() {
        return this.actor.system.scale[this.constructor.id][this.constructor.transformationLevelKey].value;
    }

    async drawTableResult() {
        const tableName = this.getRollTableName()
        const pack = game.packs.get("transformations.gh-roll-tables");
        const index = await pack.getIndex();
        const entry = index.find(e => e.name === tableName);
        const table = await pack.getDocument(entry._id);
        if (!table) {
            ui.notifications.error(`Table "${tableName}" not found`);
            return;
        }
        return await table.draw({ speaker: this.actor, roll: true, displayChat: true });
    }

    async applyRollTableResult(resultName) {
        console.error("should be implemented AND called at sub-class level!");
    }

    async removeActiveTransformationEffect() {
        const effects = this.actor.effects.filter(e =>
            e.flags["gh-transformation"]?.removeOnLongRest
        );

        if (effects.length) {
            await this.actor.deleteEmbeddedDocuments(
                "ActiveEffect",
                effects.map(e => e.id)
            );
        }
    }

    static register() {
        if (!globalThis.TransformationModule?.Transformations) {
        throw new Error(
            "Transformations is not initialized. " +
            "Ensure it is created in the init hook before importing subclasses."
        );
        }

        if (typeof this.id !== "string" || !this.id.length) {
        throw new Error(
            `Transformation subclass "${this.name}" must define a static id`
        );
        }

        if (TransformationModule.Transformations.has(this.id)) {
        console.warn(
            `Transformation "${this.id}" already registered. Skipping.`,
            this
        );
        return;
        }

        TransformationModule.Transformations.set(this.id, this);
        TransformationModule.RegisteredTransformations.set(this.id, this);

        console.debug(
        `Transformations | Registered: ${this.id}`,
        this
        );
    }
}