// @ts-expect-error for some reason vscode thinks this doesn't exist
import { applyRollTableResult } from "./RollTables/UnstableFormRollTable.js";

export class AberrantHorror extends TransformationModule.TransformationParent.Transformation {

    static itemId = "aberrant-horror";
    static name = "Aberrant Horror";
    static tablePrefix = "Unstable Form";
    static rollTableEffectFunction = applyRollTableResult;
    static eldritchLimbsItemIds = {
        1: 'Compendium.transformations.gh-transformations.Item.6WiJSiBbhYTH80Da',
        2: 'Compendium.transformations.gh-transformations.Item.FVXkz256XPi1Uluv'
    };
    static subClassConstants = {
        ABERRANT_CONFUSION: "AberrantConfusion",
        ABERRANT_LOSS_OF_VITALITY: "AberrantLossofVitality",
        ABERRANT_MUTATION_EFFECTS: {
            CHITINOUS_SHELL: "Chitinous Shell",
            SLIMY_FORM: "Slimy Form",
            ELDRITCH_LIMBS: "Eldritch Limbs"
        },
        HIDING_HIDEOUS_APPEARANCE: "Hiding Hideous Appearance",
        HIDE_HIDEOUS_FORM_STATUS_TEXT: "You concentrate on hiding your hideous form",
        TRANSFORMATION_STAGES: {
            1: {
                ITEMS: {
                    ABERRANT_MUTATION: "Aberrant Mutation",
                    ABERRANT_FORM: "Aberrant Form",
                    UNSTABLE_FORM: "Unstable Form"
                }
            },
            2: {
                ITEMS: {
                    EFFICIENT_KILLER: "Eldritch Limbs (Efficient Killer)",
                    WRITHING_TENDRILS: "Writhing Tendrils",
                    HIDEOUSE_APPEARANCE: "Hideous Appearance",
                },
            },
            3: {
                ITEMS: {
                    CONSTRICTING_TENDRILS: "Constricting Tendrils",
                    TERRIFYING_VISAGE: "Terrifying Visage",
                    UNSTABLE_EXISTENCE: "Unstable Existence",
                }
            },
            4: {
                ITEMS: {
                    ELDRITCH_ABERRATION: "Eldritch Aberration",
                    ENTROPIC_ABOMINATION: "Entropic Abomination",
                    POISONOUS_MUTATIONS: "Poisonous Mutations"
                },
                DAMAGE_RESISTANCES: {
                    POISONOUS_RESISTANCE: {
                        name: "Poisonous Resistance",
                        label: "Poisonous Resistance",
                        description: "Resistance to Poison Damage",
                        icon: "modules/transformations/Icons/Transformations/Aberrant%20Horror/Poison_Resistance.png",
                        changes: [{
                            key: "system.traits.dr.value",
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: "poison"
                        }]
                    }
                },
                DAMAGE_IMMUNITIES: {
                    POISONED_IMMUNITY: {
                        name: "Poisoned Condition Immunity",
                        label: "Poisoned Condition Immunity",
                        description: "Immunity to the Poisoned Condition",
                        icon: "modules/transformations/Icons/Transformations/Aberrant%20Horror/Poisoned_immunity.png",
                        changes: [{
                            key: "system.traits.ci.value",
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                            value: "poisoned"
                        }]
                    }
                }
            }
        }
    };

    constructor(actor) {
        super(actor);
        TransformationModule.logger.debug("Aberrant horror constructor start");
        this.constants = { ...this.constants, ...this.constructor.subClassConstants };
        this.aberrantMutationEffects = this.constructor.subClassConstants.ABERRANT_MUTATION_EFFECTS;
        this.eldritchLimbsItemIds = this.constructor.eldritchLimbsItemIds;
        this.iconFolder += this.name + "/";
        TransformationModule.logger.debug("icon folder Transformation constructor 3", this.iconFolder);
        this.initialized = true
    }

    onDamage() {
        TransformationModule.logger.log("onDamage AberrantHorror");
    }

    onBloodied() {
        this.aberrantForm()
        if (this.TransformationStage >= 2) {
            this.hideousAppearance()
        }
        if (this.TransformationStage > 3) {
            this.entropicAbomination(this.globalConstants.CONDITION.BLOODIED)
        }
    }

    onShortRest(result) {
        TransformationModule.logger.log("onShortRest AberrantHorror");
        this.removeAberrantMutationEffects()
    }

    onLongRest(result) {
        TransformationModule.logger.log("onLongRest AberrantHorror");
        this.removeAberrantMutationEffects()
        super.setActorFlag(this.constants.HAS_BEEN_BLOODIED_SINCE_LONG_REST, false);
        super.rollResultFromRollTable();
    }

    onInitiative() {
        TransformationModule.logger.log("onInitiative AberrantHorror");
        if (this.actor.statuses.has(this.constants.ABERRANT_CONFUSION)) {
            this.actor.toggleStatusEffect(globalConstants.CONDITION.STUNNED, { active: true });
            super.sendChatMessage(this.getChatMessage(this.constants.ABERRANT_CONFUSION))
        }
    }

    onConcentration() {
        TransformationModule.logger.log("onConcentration AberrantHorror");
        if (this.TransformationStage >= 2) {
            this.hideousAppearance()
        }
    }

    onUnconscious() {
        TransformationModule.logger.log("onUnconscious AberrantHorror");
        if (this.TransformationStage >= 2) {
            this.hideousAppearance()
        }
    }

    onHitDieRoll(context) {
        TransformationModule.logger.log("onHitDieRoll AberrantHorror");
        context = this.aberrantLossofVitality(context);
        return context;
    }

    onSpellSavingThrow(roll) {
        TransformationModule.logger.log("onSpellSavingThrow AberrantHorror")
        if (this.TransformationStage >= 3) {
            roll = this.unstableExistence(roll);
        }
        return roll
    }

    onSavingThrow(roll) {
        TransformationModule.logger.log("onSavingThrow AberrantHorror")
        if (this.TransformationStage > 3) {
            roll = this.entropicAbomination(this.globalConstants.ROLL_TYPE.SAVING_THROW, roll);
        }
        return roll
    }

    getTriggerFlag(context, type) {
        switch (type) {
            case globalConstants.TRIGGER_FLAG.SPELL_SAVE:
                if (this.TransformationStage > 3) {
                    context.rolls[0].options.transformations = {
                        [this.itemId]: [
                            globalConstants.TRIGGER_FLAG.SPELL_SAVE
                        ]
                    }
                }
                break;
        }
        return context;
    }

    getChatMessage(type) {
        let chatMessage = super.getChatMessage(type);
        switch (type) {
            case this.constants.TRANSFORMATION_STAGES[1].ABERRANT_FORM:
                chatMessage = `${this.actor.name}s Aberrant Form activates and gives ${regainedHitPoints} temporary hit points!`;
                break;
            case this.constants.ABERRANT_CONFUSION:
                chatMessage = `Due to Aberrant Confusion ${this.actor.name} is stunned for the first round!`
                break;
        }
        return chatMessage;
    }

    async applyRollTableResult(resultName) {
        this.constructor.rollTableEffectFunction(this.actor, resultName, this.iconFolder)
    }

    async hideousAppearance() {
        if (this.actor.effects.find(e => e.name === this.constants.HIDING_HIDEOUS_APPEARANCE)) {
            const conSaveResult = await this.hideousAppearanceConSave()
            if (!conSaveResult) {
                const effect = this.actor.effects.find(e => e.name === this.constants.HIDING_HIDEOUS_APPEARANCE);
                if (effect) {
                    await effect.delete();
                }
            }
        }
    }

    async hideousAppearanceConSave() {
        let dc = 0;
        switch (this.TransformationStage) {
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
        const result = await TransformationModule.dialogs.getD20RollDialog(this.actor, this.globalConstants.ABILITY.CONSTITUTION, this.globalConstants.ROLL_TYPE.SAVING_THROW, dc);
        if (result === null) return;
        return (result >= dc)
    }

    hidehideousAppearance() {
        const icon = `${iconFolder}/Hideous_Appearance.png`;
        const changes = [
            { key: `actor.system.concentration.ability`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: this.constants.HIDING_HIDEOUS_APPEARANCE }
        ]
        TransformationModule.utils.createActiveEffectOnActor(this.actor, this.constants.HIDING_HIDEOUS_APPEARANCE, this.constants.HIDE_HIDEOUS_FORM_STATUS_TEXT, icon, changes);
    }

    async aberrantForm() {
        const item = this.actor.items.find(i => i.name === this.constants.TRANSFORMATION_STAGES[1].ABERRANT_FORM);
        if (!item) {
            ui.notifications.warn(`${this.actor.name} does not have an item named "${itemName}".`);
            return;
        }
        if (item.system.uses.value > 0 && TransformationModule.utils.actorIsBloodied(this.actor)) {
            await item.update({
                "system.uses.spent": Math.min(item.system.uses.value + 1, item.system.uses.max)
            });
            const regainedHitPoints = this.actor.system.attributes.prof + this.TransformationStage
            super.sendChatMessage(this.getChatMessage(this.constants.TRANSFORMATION_STAGES[1].ABERRANT_FORM));
            this.actor.system.attributes.hp.temp = regainedHitPoints
        }
    }

    async aberrantLossofVitality(context) {
        if (this.actor.statuses.has(this.constants.ABERRANT_LOSS_OF_VITALITY)) {
            const roll = context.rolls[0].parts[0];
            context.rolls[0].parts[0] = roll.replace("+ @abilities.con.mod", "")
        }
        return context;
    }

    async unstableExistence(roll) {
        TransformationModule.logger.log(roll)
        const natRoll = (roll._total - roll.data.mod)
        if (natRoll < 3) {
            await this.rollResultFromRollTable(true)
        }
    }

    async entropicAbomination(type, data = null) {
        if (type == this.globalConstants.ROLL_TYPE.SAVING_THROW) {
            roll = data
            TransformationModule.logger.log(roll)
            const rollResult = (roll._total - roll.data.mod)
            if (natRoll < 3) {
                await this.rollResultFromRollTable(true)
            }
        } else if (type == this.globalConstants.CONDITION.BLOODIED) {
            if (!super.getActorFlag(this.constants.HAS_BEEN_BLOODIED_SINCE_LONG_REST)) {
                super.setActorFlag(this.constants.HAS_BEEN_BLOODIED_SINCE_LONG_REST, true);
                await this.rollResultFromRollTable(true)
            }
        }
    }

    async chitinousShell() {
        TransformationModule.logger.log("Chitinous Shell called!");
        this.removeAberrantMutationEffects(this.aberrantMutationEffects.CHITINOUS_SHELL);
    }

    async slimyForm() {
        TransformationModule.logger.log("Slimy Form called!");
        this.removeAberrantMutationEffects(this.aberrantMutationEffects.SLIMY_FORM);
    }

    async eldritchLimbs() {
        TransformationModule.logger.log("Eldritch Limbs called!");
        this.removeAberrantMutationEffects(this.aberrantMutationEffects.ELDRITCH_LIMBS);
        TransformationModule.logger.log(this.eldritchLimbsItemIds[this.TransformationStage]);
        const item = await fromUuid(this.eldritchLimbsItemIds[this.TransformationStage]);
        if (item && this.actor) {
            await this.actor.createEmbeddedDocuments('Item', [item.toObject()]);
        } else {
            ui.notifications.error("Item from Compendium or Actor not found!");
        }
    }

    async removeAberrantMutationEffects(effectToExclude = null) {
        if (this.hasAberrantMutationEffects(effectToExclude)) {
            await this.actor.deleteEmbeddedDocuments(
                "ActiveEffect",
                effects
            );
            if (!effectToExclude || effectToExclude != this.aberrantMutationEffects.ELDRITCH_LIMBS) {
                this.removeEldritchLimbsItems();
            }
        }
    }

    hasAberrantMutationEffects(effectToExclude = null) {
        let effectsToLookFor
        if (effectToExclude) {
            effectsToLookFor = this.aberrantMutationEffects.filter(effect => effect != effectToExclude);
        } else {
            effectsToLookFor = this.aberrantMutationEffects;
        }
        const effects = this.actor.effects.filter(effect => effectsToLookFor.includes(effect.name)).map(e => e.id);
        if (effects.length === 0) {
            TransformationModule.logger.log("No matching effects found.");
            return false;
        } else {
            return true
        }
    }

    async removeEldritchLimbsItems() {
        let itemsToRemove = [];
        let itemsfound = [];
        for (let index = 1; index <= 2; index++) {
            const itemId = this.eldritchLimbsItemIds[index];
            const itemNameToLookFor = (await fromUuid(itemId)).name
            this.actor.items.filter(i =>
                i.name == itemNameToLookFor
            ).forEach(foundItem => {
                itemsToRemove.push(
                    foundItem.id
                );
            });
            TransformationModule.logger.log(itemsToRemove);
        }
        itemsToRemove
        await this.actor.deleteEmbeddedDocuments("Item", itemsToRemove);
    }

    getPillsData(isEditable) {
        const pillsData = {
            transformation: {
                id: this.id,
                uuid: this.uuid,
                img: this.img,
                name: this.name,
                transformationStage: this.transformationStage,
            },
            actor: this.actor,
            DND5E: dnd5e,
            transformationConfig: "Configure Transformation",
            editable: isEditable
        }
        return pillsData;
    }

    static {
        this.register();
    }
}