export class Transformation {

    id;
    itemId;
    uuid;
    img;
    name;
    tablePrefix;
    transformationLevel = 0;
    initialized = false;
    actor;
    rollTableEffectFunction;

    static compendiumTransformation;
    static iconFolder = "modules/transformations/Icons/Transformations/";
    static constants = {
        APPLY_LOWER_RESULT: "onlyApplyLowerResult",
        CURRENT_EFFECT_RANGE_LOW: "currentEffectRangeLow",
        MODULE_ID: "transformations",
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
        this.transformationLevel = this.getActorTransformationLevel();
        this.tablePrefix = this.constructor.tablePrefix;
        this.rollTableEffectFunction = this.constructor.rollTableEffectFunction;
        this.iconFolder = this.constructor.iconFolder;
        Transformation.setCompendiumValues(this)
    }

    getTransformationType(actor) {
        let transformation = this;
        if (!actor) {
            TransformationModule.logger.warn("No actor was supplied.");
            return
        } else {
            const actorTransformation = actor.flags.dnd5e.transformation
            TransformationModule.logger.debug("actorTransformation: ", actorTransformation);
            TransformationModule.Transformations.forEach(transformationSubClass => {
                TransformationModule.logger.debug("Transformation sub class itemId: ", transformationSubClass.itemId);
                if (actorTransformation == transformationSubClass.itemId) {
                    transformation = new transformationSubClass(actor);
                }
            });
        }
        TransformationModule.logger.debug("actorTransformation that was returned: ", transformation);
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

    onTransformationUpdate() {
        this.constructor.removeAllTransformationThings(this.actor);
        if (this.initialized) {
            this.applyTransformationStage();
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
        TransformationModule.logger.debug(drawResult);
        if (!onlyApplyLowerResult || !this.getActorFlag() || (onlyApplyLowerResult && drawResult.roll._total < this.getActorFlag())) {
            if (onlyApplyLowerResult) {
                this.sendChatMessage(this.constants.APPLY_LOWER_RESULT);
            }
            await this.removeActiveTransformationEffect();
            await this.applyRollTableResult(drawResult.results[0].name);
            TransformationModule.logger.debug(drawResult.results[0])
            TransformationModule.logger.debug(drawResult.results[0].range)
            TransformationModule.logger.debug(drawResult.results[0].range[0])
            await this.setActorFlag(this.constants.CURRENT_EFFECT_RANGE_LOW, drawResult.results[0].range[0])
        }
    }

    getRollTableName() {
        return (this.tablePrefix + " Stage " + this.transformationLevel)
    }

    getActorTransformationLevel() {
        TransformationModule.logger.debug("Transformation level:", this.actor.flags.dnd5e["transformation-level"])
        return this.actor.flags.dnd5e["transformation-level"];
    }

    async getRollTable() {
        const tableName = this.getRollTableName()
        const index = getCompendiumIndexByName(this.constants.ROLL_TABLE_COMPENDIUM);
        const entry = index.find(e => e.name === tableName);
        const table = await pack.getDocument(entry._id);
        if (!table) {
            ui.notifications.error(`Table "${tableName}" not found`);
            return;
        }
        return table;
    }

    async drawTableResult(table) {
        TransformationModule.logger.debug(table);
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
            this.actor.getFlag(this.MODULE_ID, this.itemId) ?? {}
        );
        return data[flag]
    }

    async setActorFlag(flag, value) {
        const data = foundry.utils.deepClone(
            this.actor.getFlag(this.MODULE_ID, this.itemId) ?? {}
        );
        data[flag] = value;
        await this.actor.setFlag(this.MODULE_ID, this.itemId, data);
    }

    static getItemFlag(item, flag) {
        const data = foundry.utils.deepClone(
            item.getFlag(this.MODULE_ID, flag) ?? {}
        );
        return data
    }

    async setItemFlag(item, flag, value) {
        const data = foundry.utils.deepClone(
            item.getFlag(this.MODULE_ID, flag) ?? {}
        );
        data = value;
        await item.setFlag(this.MODULE_ID, flag, data);
    }

    getChatMessage(type) {
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

    applyTransformationStage() {
        TransformationModule.logger.debug("Applying transformation stage:", this.transformationLevel);
        TransformationModule.logger.debug("Transformation stages:", this.constants.TRANSFORMATION_STAGES);
        TransformationModule.logger.debug("Transformation stage items:", this.constants.TRANSFORMATION_STAGES[this.transformationLevel]);
        this.getTransformationStages().forEach(async (itemName, stage) => {
            TransformationModule.logger.debug("Applying transformation item: ", stage, itemName);
            const itemData = await TransformationModule.Utils.getItemDataByName(itemName);
            this.setItemFlag(itemData, globalConstants.TRANSFORMATION_ITEM_FLAG, true);
            if (itemData) {
                TransformationModule.logger.debug("Creating item on actor: ", itemData);
                //await this.actor.createEmbeddedDocuments("Item", [itemData]);
            }
        });
    }

    getTransformationStages() {
        let stages = [];
        switch (this.getActorTransformationLevel()) {
            case 4:
                TransformationModule.logger.debug("Getting transformation stages for level 4");
                stages = this.constants.TRANSFORMATION_STAGES[4];
            case 3:
                TransformationModule.logger.debug("Getting transformation stages for level 3");
                stages = stages.concat(this.constants.TRANSFORMATION_STAGES[3]);
            case 2:
                TransformationModule.logger.debug("Getting transformation stages for level 2");
                stages = stages.concat(this.constants.TRANSFORMATION_STAGES[2]);
            case 1:
                TransformationModule.logger.debug("Getting transformation stages for level 1");
                stages = stages.concat(this.constants.TRANSFORMATION_STAGES[1]);
                break;
        }
        TransformationModule.logger.debug("Final transformation stages: ", stages);
        return stages;
    }

    static removeAllTransformationThings(actor) {
        TransformationModule.logger.debug("Removing all transformation items from actor:", actor);
        actor.items.filter(i => this.getItemFlag(i, TransformationModule.constants.TRANSFORMATION_ITEM_FLAG)).forEach(async (item) => {
            await actor.deleteEmbeddedDocuments("Item", [item.id]);
        });
    }

    static getTransformationByName(name) {
        const index = this.getCompendiumIndexByName(this.constants.TRANSFORMATIONS_COMPENDIUM);
        TransformationModule.logger.debug("index found:", index)
        const entry = index.find(e => e.name === name);
        return entry;
    }

    static getCompendiumIndexByName(compendiumName) {
        TransformationModule.logger.debug("compendium name: ", compendiumName)
        const pack = TransformationModule.compendiums[compendiumName];
        TransformationModule.logger.debug("compendium pack: ", pack)
        const index = pack.index;
        TransformationModule.logger.debug("index: ", index)
        return index
    }

    static setCompendiumValues(transformation) {
        const compendiumTransformation = this.getTransformationByName(transformation.name);
        TransformationModule.logger.debug("compendium transformation:", compendiumTransformation);
        transformation.uuid = compendiumTransformation.uuid;
        transformation.id = compendiumTransformation._id
        transformation.img = compendiumTransformation.img;
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