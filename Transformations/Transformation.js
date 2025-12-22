class Transformation {

    id;
    name;
    tablePrefix;
    transformationLevelKey;
    transformationLevel = 0
    initialized = false

    constructor(actor) {
        let transformation;
        Object.values(TRANSFORMATIONS).forEach(transformationName => {
            if (actor.items.getName(transformationName)) {
                transformation = transformationName;
            }
        });
        switch (transformation) {
            case ABERRANT_HORROR:
                return new AberrantHorror(actor);
            case FEY:
                console.log(`${transformation} not yet implemented!`);
                break;
            case FIEND:
                console.log(`${transformation} not yet implemented!`);
                break;
            case HAG:
                console.log(`${transformation} not yet implemented!`);
                break;
            case LICH:
                console.log(`${transformation} not yet implemented!`);
                break;
            case LYCANTHROPE:
                console.log(`${transformation} not yet implemented!`);
                break;
            case OOZE:
                console.log(`${transformation} not yet implemented!`);
                break;
            case PRIMORDIAL:
                console.log(`${transformation} not yet implemented!`);
                break;
            case SERAPH:
                console.log(`${transformation} not yet implemented!`);
                break;
            case SHADOWSTEEL_GHOUL:
                console.log(`${transformation} not yet implemented!`);
                break;
            case SPECTER:
                console.log(`${transformation} not yet implemented!`);
                break;
            case VAMPIRE:
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

    async rollResultFromRollTableTable(actor, tableName) {
        await removeActiveTransformationEffect(actor);
        const drawResult = await drawTableResult(actor, transformationTableName);
        await applyRollTableResult(actor, drawResult.results[0].name, transformationTableName);
    }

    getRollTableName(transformationObject) {
        return (transformationObject.tablePrefix + " Stage " + transformationObject.transformationLevel)
    }

    getActorTransformationLevel(transformation) {
        this.level = transformation.actor.system.scale[transformation.id][transformation.transformationLevelKey].value;
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
        if (transformationTableName.startsWith("Unstable Form")) {
            await applyUnstableForm(actor, resultName);
        }
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
}
