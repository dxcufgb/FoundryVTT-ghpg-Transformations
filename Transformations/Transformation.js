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
        TransformationModule.Transformations.forEach(transformationSubClass => {
            if (actor.items.find(obj => obj.identifier === transformationSubClass.id)) {
                transformation = new transformationSubClass(actor);
            }
        });
        return transformation;
    }

    onDamage() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onShortRest() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onLongRest() {
        console.error("should be implemented AND called at sub-class level!");
    }

    onInitiative() {
        console.error("should be implemented AND called at sub-class level!");
    }

    async rollResultFromRollTable(transformation) {
        await this.removeActiveTransformationEffect(transformation);
        const drawResult = await this.drawTableResult(transformation);
        console.log(drawResult);
        await this.applyRollTableResult(drawResult.results[0].name);
    }

    getRollTableName(transformationObject) {
        return (transformationObject.tablePrefix + " Stage " + transformationObject.transformationLevel)
    }

    getActorTransformationLevel(transformation) {
        return transformation.actor.system.scale[transformation.constructor.id][transformation.constructor.transformationLevelKey].value;
    }

    async drawTableResult(transformation) {
        const table = game.tables.getName(transformation.tableName);
        if (!table) {
            ui.notifications.error(`Table "${transformation.tableName}" not found`);
            return;
        }
        return await table.draw({ speaker: transformation.actor, roll: true, displayChat: true });
    }

    async applyRollTableResult(resultName) {
        console.error("should be implemented AND called at sub-class level!");
    }

    async removeActiveTransformationEffect(transformation) {
        console.log(transformation);
        console.log(this);
        const effects = transformation.actor.effects.filter(e =>
            e.flags["gh-transformation"]?.removeOnLongRest
        );

        if (effects.length) {
            await actor.deleteEmbeddedDocuments(
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

        console.debug(
        `Transformations | Registered: ${this.id}`,
        this
        );
    }
}