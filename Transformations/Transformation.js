export class Transformation {

    id;
    itemId;
    uuid;
    img;
    name;
    tablePrefix;
    transformationStage = 0;
    initialized = false;
    actor;
    rollTableEffectFunction;

    static compendiumTransformation;
    static iconFolder = "modules/transformations/Icons/Transformations/";
    static constants = {
        APPLY_LOWER_RESULT: "onlyApplyLowerResult",
        CURRENT_EFFECT_RANGE_LOW: "currentEffectRangeLow",
        SHUOLD_BE_IN_SUBCLASS_LOG: "should be implemented AND called at sub-class level!",
        HAS_BEEN_BLOODIED_SINCE_LONG_REST: "hasBeenBloodiedSinceLongRest",
        ROLL_TABLE_COMPENDIUM: "rollTables",
        TRANSFORMATIONS_COMPENDIUM: "transformations"
    };

    constructor(actor) {
        this.constants = this.constructor.constants;
        this.globalConstants = TransformationModule.constants;
        this.actor = actor;
        this.itemId = this.constructor.itemId;
        this.name = this.constructor.name;
        this.transformationStage = this.getActorTransformationStage();
        this.tablePrefix = this.constructor.tablePrefix;
        this.rollTableEffectFunction = this.constructor.rollTableEffectFunction;
        this.iconFolder = this.constructor.iconFolder;
        Transformation.setCompendiumValues(this)
    }

    getTransformationType(actor) {
        let transformation = new Transformation(actor);
        if (!actor) {
            TransformationModule.logger.warn("No actor was supplied.");
            return
        } else {
            const actorTransformation = actor.flags.dnd5e.transformation
            TransformationModule.Transformations.forEach(transformationSubClass => {
                if (actorTransformation == transformationSubClass.itemId) {
                    transformation = new transformationSubClass(actor);
                }
            });
        }
        return transformation;
    }

    onDamage() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onShortRest(result) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onLongRest(result) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onInitiative() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onConcentration() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onHitDieRoll(context) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onSpellSavingThrow(context) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onSavingThrow(context) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onBloodied() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onUnconscious() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    async onTransformationUpdate() {
        await this.removeAllTransformationThings();
        if (this.initialized) {
            await this.applyTransformationStage();
        }
    }

    getTriggerFlag(context, type) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    sendChatMessage(type) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    getPillsData() {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    async rollResultFromRollTable(onlyApplyLowerResult = false) {
        let table = await this.getRollTable()
        const drawResult = await this.drawTableResult(table);
        if (!onlyApplyLowerResult || !this.getActorFlag() || (onlyApplyLowerResult && drawResult.roll._total < this.getActorFlag())) {
            if (onlyApplyLowerResult) {
                this.sendChatMessage(this.getChatMessage(this.constants.APPLY_LOWER_RESULT));
            }
            await this.removeActiveTransformationEffect();
            await this.applyRollTableResult(drawResult.results[0].name);
            await this.setActorFlag(this.constants.CURRENT_EFFECT_RANGE_LOW, drawResult.results[0].range[0])
        }
    }

    getRollTableName() {
        return (this.tablePrefix + " Stage " + this.transformationStage)
    }

    getActorTransformationStage() {
        return this.actor.flags.dnd5e.transformationStage;
    }

    async getRollTable() {
        const tableName = this.getRollTableName()
        const index = Transformation.getCompendiumIndexByName(this.constants.ROLL_TABLE_COMPENDIUM);
        const entry = index.find(e => e.name === tableName);
        const table = await TransformationModule.compendiums[this.constants.ROLL_TABLE_COMPENDIUM].getDocument(entry._id);
        if (!table) {
            ui.notifications.error(`Table "${tableName}" not found`);
            return;
        }
        return table;
    }

    async drawTableResult(table) {
        return await table.draw({ speaker: this.actor, roll: true, displayChat: true });
    }

    async applyRollTableResult(effectName) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    async removeActiveTransformationEffect() {
        const effects = this.actor.effects.filter(e =>
            e.flags[this.globalConstants.EFFECT_FLAG_MODULE_NAME]?.removeOnLongRest
        );

        if (effects.length) {
            await this.actor.deleteEmbeddedDocuments(
                "ActiveEffect",
                effects.map(e => e.id)
            );
        }
    }

    getActorFlag(flag) {
        const data = foundry.utils.deepClone(
            this.actor.getFlag(this.globalConstants.EFFECT_FLAG_MODULE_NAME, this.itemId) ?? {}
        );
        return data[flag]
    }

    async setActorFlag(flag, value) {
        const data = foundry.utils.deepClone(
            this.actor.getFlag(this.globalConstants.EFFECT_FLAG_MODULE_NAME, this.itemId) ?? {}
        );
        data[flag] = value;
        await this.actor.setFlag(this.globalConstants.EFFECT_FLAG_MODULE_NAME, this.itemId, data);
    }

    static getItemFlag(item, flag) {
        if (!item) return {};
        if (!flag) return {};
        return item.getFlag(
            TransformationModule.constants.EFFECT_FLAG_MODULE_NAME,
            flag
        ) ?? null;
    }

    async setItemFlag(item, flag, value) {
        await item.setFlag(TransformationModule.constants.EFFECT_FLAG_MODULE_NAME, flag, value);
    }

    getChatMessage(type, data = null) {
        let chatMessage = ''
        switch (type) {
            case this.constants.APPLY_LOWER_RESULT:
                chatMessage = `${this.actor.name}s Unstable Existence causes the Unstable form to shift!`;
                break;
        }
        return chatMessage;
    }

    sendChatMessage(chatMessage) {
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: chatMessage
        });
    }

    getPillsData(isEditable) {
        const pillsData = {
            transformation: "None",
            actor: this.actor,
            DND5E: dnd5e,
            transformationConfig: "Configure Transformation",
            editable: isEditable
        }
        return pillsData;
    }

    actorHasTransformationItem(itemName) {
        return this.actor.items.some(i =>
            i.name === itemName &&
            i.getFlag(
                TransformationModule.constants.EFFECT_FLAG_MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG
            )
        );
    }

    actorHasTransformationEffect(effectLabel) {
        return this.actor.effects.some(e =>
            e.label === effectLabel &&
            e.getFlag(
                TransformationModule.constants.EFFECT_FLAG_MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG
            )
        );
    }

    async addItemToActor(item) {
        if (item && this.actor) {
            if (!this.actorHasTransformationItem(item.name)) {
                let [createdItem] = await this.actor.createEmbeddedDocuments("Item", [item.toObject()]);
                await this.setItemFlag(createdItem, this.globalConstants.TRANSFORMATION_ITEM_FLAG, true);
            }
        }
    }

    async applyTransformationStage() {
        const stages = this.getTransformationStages();
        if (stages.ITEMS != null) {
            if (stages.ITEMS.CHOICES) {
                let choices = [];
                Object.values(stages.ITEMS.CHOICES).forEach(async (choice) => {
                    const itemData = await Transformation.getCompendiumEntryByName(choice);
                    let item = await fromUuid(itemData.uuid);
                    choices.push(item);
                });
                const choiceKey = `stage${this.transformationStage}ChoiceMade`;
                if (!(this.actor.getFlag(TransformationModule.constants.EFFECT_FLAG_MODULE_NAME, choiceKey))) {
                    const choice = await TransformationModule.utils.renderTransformationTemplate("choiceDialog", choices);
                    await this.actor.setFlag(TransformationModule.constants.EFFECT_FLAG_MODULE_NAME, choiceKey, choice.name);
                    await this.addItemToActor(choice);
                } else {
                    const choiceName = this.actor.getFlag(TransformationModule.constants.EFFECT_FLAG_MODULE_NAME, choiceKey);
                    const itemData = await Transformation.getCompendiumEntryByName(choiceName);
                    let item = await fromUuid(itemData.uuid);
                    await this.addItemToActor(item);
                }
            }
            Object.values(stages.ITEMS).forEach(async (itemName) => {
                const itemData = await Transformation.getCompendiumEntryByName(itemName);
                let item = await fromUuid(itemData.uuid);
                await this.addItemToActor(item);
            });
        }
        if (stages.DAMAGE_RESISTANCES != null) {
            Object.values(stages.DAMAGE_RESISTANCES).forEach(async (resistance) => {
                if (!this.actorHasTransformationEffect(resistance.label)) {
                    let [createdResistance] = await this.actor.createEmbeddedDocuments("ActiveEffect", [resistance]);
                    this.setItemFlag(createdResistance, this.globalConstants.TRANSFORMATION_ITEM_FLAG, true);
                }
            });
        }
        if (stages.DAMAGE_IMMUNITIES != null) {
            Object.values(stages.DAMAGE_IMMUNITIES).forEach(async (immunity) => {
                if (!this.actorHasTransformationEffect(immunity.label)) {
                    let [createdImmunity] = await this.actor.createEmbeddedDocuments("ActiveEffect", [immunity]);
                    this.setItemFlag(createdImmunity, this.globalConstants.TRANSFORMATION_ITEM_FLAG, true);
                }
            });
        }
    }

    getTransformationStages() {
        let stages = {};
        const highestStage = this.getActorTransformationStage();
        switch (Number(highestStage)) {
            case 4:
                stages.ITEMS = this.constants.TRANSFORMATION_STAGES[4].ITEMS;
                stages.DAMAGE_RESISTANCES = this.constants.TRANSFORMATION_STAGES[4].DAMAGE_RESISTANCES;
                stages.DAMAGE_IMMUNITIES = this.constants.TRANSFORMATION_STAGES[4].DAMAGE_IMMUNITIES;
            case 3:
                stages.ITEMS = { ...stages.ITEMS, ...this.constants.TRANSFORMATION_STAGES[3].ITEMS };
                stages.DAMAGE_RESISTANCES = { ...stages.DAMAGE_RESISTANCES, ...this.constants.TRANSFORMATION_STAGES[3].DAMAGE_RESISTANCES };
                stages.DAMAGE_IMMUNITIES = { ...stages.DAMAGE_IMMUNITIES, ...this.constants.TRANSFORMATION_STAGES[3].DAMAGE_IMMUNITIES };
            case 2:
                stages.ITEMS = { ...stages.ITEMS, ...this.constants.TRANSFORMATION_STAGES[2].ITEMS };
                stages.DAMAGE_RESISTANCES = { ...stages.DAMAGE_RESISTANCES, ...this.constants.TRANSFORMATION_STAGES[2].DAMAGE_RESISTANCES };
                stages.DAMAGE_IMMUNITIES = { ...stages.DAMAGE_IMMUNITIES, ...this.constants.TRANSFORMATION_STAGES[2].DAMAGE_IMMUNITIES };
            case 1:
                stages.ITEMS = { ...stages.ITEMS, ...this.constants.TRANSFORMATION_STAGES[1].ITEMS };
                stages.DAMAGE_RESISTANCES = { ...stages.DAMAGE_RESISTANCES, ...this.constants.TRANSFORMATION_STAGES[1].DAMAGE_RESISTANCES };
                stages.DAMAGE_IMMUNITIES = { ...stages.DAMAGE_IMMUNITIES, ...this.constants.TRANSFORMATION_STAGES[1].DAMAGE_IMMUNITIES };
                break;
        }
        return stages;
    }

    async removeAllTransformationThings() {
        const toRemove = this.actor.items.filter(i =>
            i.getFlag(this.globalConstants.EFFECT_FLAG_MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG)
        );

        const effectsToRemove = this.actor.effects.filter(e =>
            e.getFlag(this.globalConstants.EFFECT_FLAG_MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG)
        );

        if (toRemove.length) {

            await this.actor.deleteEmbeddedDocuments(
                "Item",
                toRemove.map(i => i.id)
            );
        }

        if (effectsToRemove.length) {
            await this.actor.deleteEmbeddedDocuments(
                "ActiveEffect",
                effectsToRemove.map(e => e.id)
            );
        }
    }

    static getCompendiumEntryByName(name) {
        const index = Transformation.getCompendiumIndexByName(this.constants.TRANSFORMATIONS_COMPENDIUM);
        const entry = index.find(e => e.name === name);
        const doc = TransformationModule.compendiums[this.constants.TRANSFORMATIONS_COMPENDIUM].getDocument(entry._id);
        return entry;
    }

    static getCompendiumIndexByName(compendiumName) {
        const pack = TransformationModule.compendiums[compendiumName];
        const index = pack.index;
        return index
    }

    static setCompendiumValues(transformation) {
        if (transformation.name != "Transformation") {
            const compendiumTransformation = Transformation.getCompendiumEntryByName(transformation.name);
            transformation.uuid = compendiumTransformation.uuid;
            transformation.id = compendiumTransformation._id
            transformation.img = compendiumTransformation.img;
        }
    }

    static register() {
        if (!globalThis.TransformationModule?.Transformations) {
            throw new Error(
                "Transformations is not initialized. " +
                "Ensure it is created in the init hook before importing subclasses."
            );
        }

        if (typeof this.name !== "string" || !this.name.length) {
            throw new Error(
                `Transformation subclass must define a static name`
            );
        }

        if (typeof this.itemId !== "string" || !this.itemId.length) {
            throw new Error(
                `Transformation subclass "${this.name}" must define a static itemId`
            );
        }

        if (typeof this.tablePrefix !== "string" || !this.tablePrefix.length) {
            throw new Error(
                `Transformation subclass "${this.name}" must define a static tablePrefix`
            );
        }

        if (TransformationModule.Transformations.has(this.itemId)) {
            TransformationModule.logger.warn(
                `Transformation "${this.itemId}" already registered. Skipping.`,
                this
            );
            return;
        }
        Transformation.setCompendiumValues(this)
        TransformationModule.Transformations.set(this.itemId, this);
        TransformationModule.logger.debug(
            `Registered: ${this.itemId}`,
            this
        );
    }
}