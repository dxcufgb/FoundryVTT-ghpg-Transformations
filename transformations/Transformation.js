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
            const actorTransformation = actor.flags.dnd5e.transformations
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
            e.flags[this.globalConstants.MODULE_NAME]?.removeOnLongRest
        );

        if (effects.length) {
            await this.actor.deleteEmbeddedDocuments(
                "ActiveEffect",
                effects.map(e => e.id)
            );
        }
    }

    getActorFlag(flag) {
        if (!this.actor) return {};
        if (!flag) return {};
        return this.actor.getFlag(
            TransformationModule.constants.MODULE_NAME,
            flag
        ) ?? null;
    }

    async setActorFlag(flag, value) {
        await this.actor.setFlag(TransformationModule.constants.MODULE_NAME, flag, value);
    }

    static getItemFlag(item, flag) {
        if (!item) return {};
        if (!flag) return {};
        return item.getFlag(
            TransformationModule.constants.MODULE_NAME,
            flag
        ) ?? null;
    }

    async setItemFlag(item, flag, value) {
        await item.setFlag(TransformationModule.constants.MODULE_NAME, flag, value);
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
        const actorHasItem = this.actor.items.some(i =>
            i.name == itemName &&
            i.getFlag(
                TransformationModule.constants.MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG
            )
        );
        return actorHasItem;
    }

    actorHasTransformationEffect(effectLabel) {
        return this.actor.effects.some(e =>
            e.label === effectLabel &&
            e.getFlag(
                TransformationModule.constants.MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG
            )
        );
    }

    async addItemToActor(item) {
        if (item && this.actor && item.doNotAddToActor !== true) {
            const actorHasItem = this.actorHasTransformationItem(item.name)
            if (!actorHasItem) {
                let [createdItem] = await this.actor.createEmbeddedDocuments("Item", [item.toObject()]);
                await this.setItemFlag(createdItem, this.globalConstants.TRANSFORMATION_ITEM_FLAG, true);
                await createdItem.update({
                    flags: {
                        [TransformationModule.constants.DDB_IMPORTER_MODULE_NAME]: {
                            ignoreItemImport: true
                        }
                    }
                });
            }
        }
    }

    async actorHasPreReq(preReq, stage, preReqItems) {
        let actorHasPreReq = true;
        if (preReq.uuid) {
            let satisfiedByChoice = false;
            let satisfiedByItem = false;
            for (let s = 1; s <= stage; s++) {
                const stageData = preReqItems[s];
                if (!stageData) continue;
                if (stageData.CHOICES) {
                    for (const choice of Object.values(stageData.CHOICES)) {
                        if (choice.uuid === preReq.uuid) {
                            if (this.getActorFlag(`stage-${stage}-choice`)) {
                                satisfiedByChoice = true;
                            }
                        }
                    }
                }
                if (stageData.ITEMS) {
                    for (const item of Object.values(stageData.ITEMS)) {
                        if (item.uuid === preReq.uuid) {
                            satisfiedByItem = true;
                        }
                    }
                }
            }
            if (!satisfiedByChoice && !satisfiedByItem) {
                actorHasPreReq = false
            }
        } else if (preReq == this.globalConstants.ACTOR_HAS_SPELL_SLOTS) {
            actorHasPreReq = TransformationModule.utils.hasSpellSlots(this.actor);
        }
        return actorHasPreReq;
    }

    findPreReqs(obj, results = []) {
        if (obj && typeof obj === "object") {
            if (obj.isPreReq === true) {
                results.push(obj);
            }

            for (const value of Object.values(obj)) {
                this.findPreReqs(value, results);
            }
        }
        return results;
    }


    async applyTransformationStage() {
        const stages = this.constants.TRANSFORMATION_STAGES
        let itemsToAdd = [];
        let itemsToRemove = [];
        let preReqItems = {
            1: { ITEMS: [], CHOICES: [] },
            2: { ITEMS: [], CHOICES: [] },
            3: { ITEMS: [], CHOICES: [] },
            4: { ITEMS: [], CHOICES: [] },
        };
        for (let stage = 1; stage <= 4; stage++) {
            TransformationModule.logger.debug(`Finding preReqs for stage ${stage}`, preReqItems[stage], stages[stage]);
            preReqItems[stage].ITEMS = this.findPreReqs(stages[stage].ITEMS);
            preReqItems[stage].CHOICES = this.findPreReqs(stages[stage].CHOICES);
        }
        await Promise.all(
            Array.from({ length: this.getActorTransformationStage() }, (_, i) => i + 1).map(async stage => {
                if (stages[stage].CHOICES) {
                    let madeChoice = await fromUuid(this.getActorFlag(`stage-${stage}-choice`));
                    if (!madeChoice) {
                        const choices = await Promise.all(
                            await Object.values(stages[stage].CHOICES).map(async (choice) => {
                                if (choice.preReq) {
                                    let actorHasPreReq = await this.actorHasPreReq(choice.preReq, stage - 1, preReqItems);
                                    if (actorHasPreReq) {
                                        return await this.constructor.getCompendiumDocByName(choice.name);
                                    }
                                } else {
                                    return await this.constructor.getCompendiumDocByName(choice.name);
                                }
                            })
                        );
                        TransformationModule.logger.debug(`found choices for stage ${stage}:`, choices);
                        const filteredChoices = choices.filter(c => c !== undefined);
                        TransformationModule.logger.debug(`found choices for stage ${stage}:`, filteredChoices);
                        if (filteredChoices.length > 1) {
                            madeChoice = await TransformationModule.dialogs.getTransformationChoiceDialog(filteredChoices);
                        } else {
                            madeChoice = filteredChoices[0]
                        }
                        TransformationModule.logger.debug(`Setting choice flag for stage ${stage}:`, madeChoice.uuid);
                        this.setActorFlag(`stage-${stage}-choice`, madeChoice.uuid);
                    }
                    TransformationModule.logger.debug("Adding transformation item:", madeChoice);
                    itemsToAdd.push(madeChoice);
                }
                await Promise.all(
                    await Object.values(stages[stage].ITEMS).map(async (item) => {
                        TransformationModule.logger.debug("Finding transformation item:", item.name);
                        if (item.replace) {
                            const itemToRemove = this.actor.items.find(i => i.name === item.replace);
                            if (itemToRemove) {
                                TransformationModule.logger.debug("Removing transformation item to be replaced:", itemToRemove);
                                itemsToRemove.push(itemToRemove);
                            }
                        }
                        if (!item.doNotAddToActor) {
                            const fetchedItem = await fromUuid(item.uuid);
                            TransformationModule.logger.debug("Adding transformation item:", fetchedItem);
                            itemsToAdd.push(fetchedItem);
                        }
                    })
                )
            })
        );
        for (const item of itemsToAdd) {
            await this.addItemToActor(item);
        }
        if (itemsToRemove.length) {
            await this.actor.deleteEmbeddedDocuments(
                "Item",
                itemsToRemove.map(i => i.id)
            );
        }
    }

    async removeAllTransformationThings() {
        const toRemove = this.actor.items.filter(i =>
            i.getFlag(this.globalConstants.MODULE_NAME,
                TransformationModule.constants.TRANSFORMATION_ITEM_FLAG)
        );

        const effectsToRemove = this.actor.effects.filter(e =>
            e.getFlag(this.globalConstants.MODULE_NAME,
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

    static async getCompendiumDocByName(name, compendiumName = this.constants.TRANSFORMATIONS_COMPENDIUM) {
        const pack = TransformationModule.compendiums[compendiumName]
        const entry = Transformation.getCompendiumEntryByName(name, compendiumName);
        const doc = await pack.getDocument(entry._id);
        return doc;
    }

    static getCompendiumEntryByName(name, compendiumName = this.constants.TRANSFORMATIONS_COMPENDIUM) {
        const index = Transformation.getCompendiumIndexByName(compendiumName);
        const entry = index.find(e => e.name == name);
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