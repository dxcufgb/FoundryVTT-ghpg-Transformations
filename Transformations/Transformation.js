export class Transformation {

    id;
    name;
    tablePrefix;
    transformationLevelKey;
    transformationLevel = 0;
    initialized = false;
    actor

    constructor(actor) {
        this.actor = actor;
    }

    getTransformationType(actor) {
        let transformation;
        TransformationModule.Transformations.forEach(transformationSubClass => {
            if (actor.items.find(obj => obj.identifier === transformationSubClass.id)) {
                return new transformationSubClass(actor);
            }
        });
        console.log(`${transformation} is unknown?`);
    }

    onDamage() {

    }

    onShortRest() {

    }

    onLongRest() {

    }

    onInitiative() {

    }

    async rollResultFromRollTableTable() {
        await removeActiveTransformationEffect(this.actor);
        const drawResult = await drawTableResult(this.actor, transformationTableName);
        await applyRollTableResult(this.actor, drawResult.results[0].name, transformationTableName);
    }

    getRollTableName(transformationObject) {
        return (transformationObject.tablePrefix + " Stage " + transformationObject.transformationLevel)
    }

    getActorTransformationLevel(transformation) {
        console.log(transformation);
        console.log(transformation.constructor.id);
        console.log(transformation.constructor.transformationLevelKey);
        console.log(transformation.actor.system.scale);
        return transformation.actor.system.scale[transformation.id][transformation.transformationLevelKey].value;
    }

    async drawTableResult(transformation) {
        const table = game.tables.getName(tableName);
        if (!table) {
            ui.notifications.error(`Table "${tableName}" not found`);
            return;
        }
        const draw = await table.draw({ speaker: transformation.actor, roll: true, displayChat: true });
        return draw;
    }

    async applyRollTableResult(transformation, resultName) {
        console.log("should be implemented AND called at sub-class level!")
    }

    async removeActiveTransformationEffect(transformation) {
        const effects = actor.effects.filter(e =>
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