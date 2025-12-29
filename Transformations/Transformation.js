export class Transformation {

    id;
    name;
    tablePrefix;
    transformationLevelKey;
    transformationLevel = 0;
    initialized = false;
    actor;
    rollTableEffectFunction;
    iconFolder = "modules/transformations/Icons/Transformations/";
    constants = {
        APPLY_LOWER_RESULT: "onlyApplyLowerResult",
        CURRENT_EFFECT_RANGE_LOW: "currentEffectRangeLow",
        MODULE_ID: "transformations",
        SHUOLD_BE_IN_SUBCLASS_LOG: "should be implemented AND called at sub-class level!",
        HAS_BEEN_BLOODIED_SINCE_LONG_REST: "hasBeenBloodiedSinceLongRest"
    };

    constructor(actor) {
        this.constants = this.constructor.constants;
        this.globalConstants = TransformationModule.constants;
        this.actor = actor;
        this.id = this.constructor.id
        this.name = this.constructor.name
        this.tablePrefix = this.constructor.tablePrefix
        this.rollTableEffectFunction = this.constructor.rollTableEffectFunction
        this.transformationLevelKey = this.constructor.transformationLevelKey
        TransformationModule.logger.debug("icon folder Transformation constructor", this.constructor.iconFolder)
        this.iconFolder = this.constructor.iconFolder + this.name + "/";
        TransformationModule.logger.debug("icon folder Transformation constructor", this.iconFolder)
    }

    getTransformationType(actor) {
        let transformation = this;
        if (!actor) {
            TransformationModule.logger.warn("No actor was supplied.");
            return
        } else if (!actor.items) {
            TransformationModule.logger.warn(`${actor} has no items.`)
            return
        } else {
            TransformationModule.Transformations.forEach(transformationSubClass => {
                if (actor.items.find(obj => obj.identifier === transformationSubClass.id)) {
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

    getTriggerFlag(context, type) {
        TransformationModule.logger.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }
    
    sendChatMessage(type) {
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
        return this.actor.system.scale[this.constructor.id][this.constructor.transformationLevelKey].value;
    }

    async getRollTable() {
        const tableName = this.getRollTableName()
        const pack = game.packs.get("transformations.gh-roll-tables");
        const index = await pack.getIndex();
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
            this.actor.getFlag(this.MODULE_ID, this.id) ?? {}
        );
        return data.flag
    }

    async setActorFlag(flag, value) {
        const data = foundry.utils.deepClone(
            this.actor.getFlag(this.MODULE_ID, this.id) ?? {}
        );
        data[flag] = value;
        await this.actor.setFlag(this.MODULE_ID, this.id, data);
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

        if (typeof this.id !== "string" || !this.id.length) {
            throw new Error(
                `Transformation subclass "${this.name}" must define a static id`
            );
        }

        if (typeof this.tablePrefix !== "string" || !this.tablePrefix.length) {
            throw new Error(
                `Transformation subclass "${this.name}" must define a static tablePrefix`
            );
        }

        if (typeof this.transformationLevelKey !== "string" || !this.transformationLevelKey.length) {
            throw new Error(
                `Transformation subclass "${this.name}" must define a static transformationLevelKey`
            );
        }

        if (TransformationModule.Transformations.has(this.id)) {
            TransformationModule.logger.warn(
                `Transformation "${this.id}" already registered. Skipping.`,
                this
            );
            return;
        }
        TransformationModule.Transformations.set(this.id, this);
        TransformationModule.logger.debug(
            `Registered: ${this.id}`,
            this
        );
    }
}