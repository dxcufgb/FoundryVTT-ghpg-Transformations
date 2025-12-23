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
        Object.values(TRANSFORMATIONS).forEach(transformationName => {
            if (actor.items.getName(transformationName)) {
                transformation = transformationName;
            }
        });
        switch (transformation) {
            case TRANSFORMATIONS.ABERRANT_HORROR:
                return new AberrantHorror(actor);
            case TRANSFORMATIONS.FEY:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.FIEND:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.HAG:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.LICH:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.LYCANTHROPE:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.OOZE:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.PRIMORDIAL:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.SERAPH:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.SHADOWSTEEL_GHOUL:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.SPECTER:
                console.log(`${transformation} not yet implemented!`);
                break;
            case TRANSFORMATIONS.VAMPIRE:
                console.log(`${transformation} not yet implemented!`);
                break;
            default:
                console.log(`${transformation} is unknown?`);
                break;
        }
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
        if (!this.id) {
            throw new Error("Transformation subclass must define static id");
        }

        MyModule.transformations.set(this.id, this);
    }
}