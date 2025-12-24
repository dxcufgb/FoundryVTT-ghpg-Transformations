import { applyRollTableResult } from "./RollTables/UnstableFormRollTable.js";

export class AberrantHorror extends TransformationModule.TransformationParent.Transformation {

    static id = "aberrant-horror";
    static name = "Aberrant Horror";
    static tablePrefix = "Unstable Form";
    static transformationLevelKey = "aberrant-transformation-level";
    static rollTableEffectFunction = applyRollTableResult;

    constructor(actor) {
        super(actor);
        this.transformationLevel = super.getActorTransformationLevel(this);
        this.initialized = true
    }

    onDamage() {
        console.log("onDamage AberrantHorror");
        this.aberrantForm()
        if (this.transformationLevel >= 2 && TransformationModule.utils.actorIsBloodied(this.actor)) {
          this.hideousForm()  
        }
    }

    onShortRest() {
        console.log("onShortRest AberrantHorror");
        this.aberrantLossofVitality()
    }

    onLongRest() {
        console.log("onLongRest AberrantHorror");
        super.rollResultFromRollTable();
    }

    onInitiative() {
        console.log("onInitiative AberrantHorror");
        if (this.actor.statuses.has("AberrantConfusion")) {
            this.actor.toggleStatusEffect("stunned", { active: true });
            ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor }),
                content: `Due to Aberrant Confusion ${this.actor.name} is stunned for the first round!`
            });
        }
    }

    onConcentration() {
        if (this.transformationLevel >= 2) {
            this.hideousForm()
        }
    }

    onCreateaActiveEffect(effect) {
        if (effect.label == "Unconcious") {
            this.hideousForm()
        }
    }

    async rollResultFromRollTable(actor, tableName) {
        await super.rollResultFromRollTable(actor, tableName,);
    }

    async applyRollTableResult(resultName) {
        this.constructor.rollTableEffectFunction(this.actor, resultName)
    }

    async hideousForm(actor) {
        const conSaveResult = this.hideousFormConSave()
        if (!conSaveResult){
            const effect = actor.effects.find(e => e.label === "Hiding Hideous Form");
            if (effect) {
                await effect.delete();
            }
        }
    }

    async hideousFormConSave() {
        const result = await TransformationModule.dialog.getRollDialog("Hideous Form Constitution Save", `<p>Roll a constitution save to see if you keep your hidden form</p>`);
        if (result === null) return;
        const dc = 0;
        switch (this.transformationLevel) {
            case 1:
            case 2:
                dc = 13;
                break;
            case 3:
                dc = 16;
                break;
            case 4:
                dc = 20;
                break
        }
        return (result >= dc)
    }

    hideHideousForm() {
        const icon = "icons/svg/poison.svg";
        const changes = [
            { key: `actor.system.concentration.ability`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: "Hiding Hideous Form" }
        ]
        TransformationModule.utils.createActiveEffectOnActor(this.actor, "Hiding Hideous Form", "You concentrate on hiding your hideous form.", icon, changes);
    }

    async aberrantForm() {
        const item = this.actor.items.find(i => i.name === "Aberrant Form");
        if (!item) {
            ui.notifications.warn(`${actor.name} does not have an item named "${itemName}".`);
            return;
        }
        console.log(`Found item ${item.name}, and it has ${item.system.uses.value} uses left!`);
        if (item.system.uses.value > 0 && TransformationModule.utils.actorIsBloodied(this.actor)) {
            await item.update({
                "system.uses.value": Math.max(uses.value - 1, 0)
            });
            console.log(item.system.uses.value);
            console.log(this.actor.system.attributes.prof);
            console.log(this.transformationLevel);
            const regainedHitPoints = this.actor.system.attributes.prof + this.transformationLevel
            let chatMessage = `${this.actor.name}s Aberrant Form activates and gives ${regainedHitPoints} temporary hit points!`;
            ChatMessage.create({
                user: game.user._id,
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
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