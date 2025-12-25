import { applyRollTableResult } from "./RollTables/UnstableFormRollTable.js";
import { Transformation } from "./Transformation.js";

export class AberrantHorror extends TransformationModule.TransformationParent.Transformation {

    static id = "aberrant-horror";
    static name = "Aberrant Horror";
    static tablePrefix = "Unstable Form";
    static transformationLevelKey = "aberrant-transformation-level";
    static rollTableEffectFunction = applyRollTableResult;
    static aberrantMutationEffects = ["Chitinous Shell", "Slimy Form", "Eldritch Limbs"];

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

    onShortRest(result) {
        console.log("onShortRest AberrantHorror");
        
    }

    onLongRest(result) {
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
        console.log("onConcentration AberrantHorror");
        if (this.transformationLevel >= 2) {
            this.hideousForm()
        }
    }

    onCreateaActiveEffect(effect) {
        console.log("onCreateActiveEffect AberrantHorror");
        if (effect.label == "Unconcious") {
            this.hideousForm()
        }
    }

    onHitDieRoll(context) {   
        console.log("onHitDieRoll AberrantHorror");
        context = this.aberrantLossofVitality(context);
        return context;
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
        if (item.system.uses.value > 0 && TransformationModule.utils.actorIsBloodied(this.actor)) {
            await item.update({
                "system.uses.spent": Math.min(item.system.uses.value + 1, item.system.uses.max)
            });
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

    async aberrantLossofVitality(context) {
        if (this.actor.statuses.has("AberrantLossofVitality")) {
            const roll = context.rolls[0].parts[0];
            context.rolls[0].parts[0] = roll.replace("+ @abilities.con.mod", "")
        }
        return context;
    }

    async chitinousShell() {
        console.log("Chitinous Shell called!");
        this.constructor.removeAberrantMutationEffects(this);
    }

    async slimyForm() {
        console.log("Slimy Form called!");
        this.constructor.removeAberrantMutationEffects(this);
    }

    async eldritchLimbs() {
        console.log("Eldritch Limbs called!");
        this.constructor.removeAberrantMutationEffects(this);
        console.log("Add weapons!");
    }

    static async removeAberrantMutationEffects(transformation) {
        const effects = transformation.actor.effects.filter(effect => this.constructor.aberrantMutationEffects.includes(effect.name));
        if (effects.length === 0) {
            console.log("No matching effects found.");
            return;
        }
        await transformation.actor.deleteEmbeddedDocuments(
            "ActiveEffect",
            effects.map(e => e.id)
        );
    }

    static {
        this.register();
    }
}