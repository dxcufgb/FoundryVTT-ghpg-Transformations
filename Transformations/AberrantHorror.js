export class AberrantHorror extends TransformationModule.TransformationParent.Transformation {

    static id = "aberrant-horror";
    static name = "Aberrant Horror";
    static tablePrefix = "Unstable Form Stage";
    static transformationLevelKey = "aberrant-transformation-level";

    constructor(actor) {
        super(actor);
        this.id = id
        this.name = name
        this.tablePrefix = tablePrefix
        this.transformationLevelKey = transformationLevelKey
        this.transformationLevel = super.getActorTransformationLevel(this);
        this.initialized = true
    }

    onDamage() {
        this.aberrantForm()
    }

    onShortRest() {
        this.aberrantLossofVitality()
    }

    onLongRest() {
        rollResultFromRollTableTable(this.actor, super.getRollTableName(this));
    }

    onInitiative() {
        if (this.actor.statuses.has("AberrantConfusion")) {
            this.actor.toggleStatusEffect("stunned", { active: true });
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: `Due to Aberrant Confusion ${this.actor.name} is stunned for the first round!`
            });
        }
    }

    async rollResultFromRollTableTable(actor, tableName) {
        await super.rollResultFromRollTableTable(actor, tableName,);
    }

    async applyRollTableResult(resultName) {
        if (transformationTableName.startsWith("Unstable Form")) {
            await applyUnstableForm(this.actor, resultName);
        }
    }

    actorIsHidingHideousForm(actor) {
        return (actor.system.concentration.ability == "Hide Hideous Form");
    }

    aberrantForm() {
        const item = this.actor.items.find(i => i.name === "Aberrant Form");
        if (!item) {
            ui.notifications.warn(`${actor.name} does not have an item named "${itemName}".`);
            return;
        }
        console.log(`Found item ${item.name}, and it has ${item.system.uses.value} uses left!`);
        if (item.system.uses.value > 0 && actorIsBloodied(this.actor)) {
            item.system.uses.value--;
            const regainedHitPoints = this.actor.system.attributes.prof + this.actorTransformationLevel
            let chatMessage = `${actor.name}s Aberrant Form activates and gives ${regainedHitPoints} temporary hit points!`;
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                content: chatMessage
            });
            this.actor.system.attributes.hp.temp = regainedHitPoints
        }
    }

    aberrantLossofVitality() {
        if (this.actor.statuses.has("AberrantLossofVitality") && result.dhd != 0) {
            console.log(result.dhd);
            console.log((result.dhd * -1));
            console.log((result.dhd * -1) * actor.system.abilities.con.mod);
            actor.system.attributes.hp.value -= ((result.dhd * -1) * actor.system.abilities.con.mod);
            console.log(actor.system.attributes.hp.value);
        }
    }

    static {
        this.register();
    }
}