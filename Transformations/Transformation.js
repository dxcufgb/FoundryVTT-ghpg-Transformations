export class Transformation {

    id;
    name;
    tablePrefix;
    transformationLevelKey;
    transformationLevel = 0;
    initialized = false;
    actor;
    rollTableEffectFunction;
    constants = {
        APPLY_LOWER_RESULT: "onlyApplyLowerResult",
        CURRENT_EFFECT_RANGE_LOW: "currentEffectRangeLow",
        MODULE_ID: "transformations",
        SHUOLD_BE_IN_SUBCLASS_LOG: "should be implemented AND called at sub-class level!"
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
    }

    getTransformationType(actor) {
        let transformation = this;
        if (!actor) {
            console.log("No actor was supplied.");
            return
        } else if (!actor.items) {
            console.log(`${actor} has no items.`)
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
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onShortRest(result) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onLongRest(result) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onInitiative() {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onConcentration() {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }
    
    onHitDieRoll(context) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }
    
    onSpellSavingThrow(context) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }
    
    onSavingThrow(context) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onBloodied() {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    onUnconscious() {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    getTriggerFlag(context, type) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }
    
    sendChatMessage(type) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    async rollResultFromRollTable(onlyApplyLowerResult = false) {
        let table = await this.getRollTable()
        const drawResult = await this.drawTableResult(table);
        console.log(drawResult);
        if (!onlyApplyLowerResult || !this.getActorFlag() || (onlyApplyLowerResult && drawResult.roll._total < this.getActorFlag())) {
            if (onlyApplyLowerResult) {
                this.sendChatMessage(this.constants.APPLY_LOWER_RESULT);
            }
            await this.removeActiveTransformationEffect();
            await this.applyRollTableResult(drawResult.results[0].name);
            console.log(drawResult.results[0])
            console.log(drawResult.results[0].range)
            console.log(drawResult.results[0].range[0])
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
        console.log(table);
        return await table.draw({ speaker: this.actor, roll: true, displayChat: true });
    }

    async applyRollTableResult(resultName) {
        console.error(this.constants.SHUOLD_BE_IN_SUBCLASS_LOG);
    }

    async removeActiveTransformationEffect() {
        const effects = this.actor.effects.filter(e =>
            e.flags["gh-transformation"]?.removeOnLongRest
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

        if (typeof this.id !== "string" || !this.id.length) {
        throw new Error(
            `Transformation subclass "${this.name}" must define a static id`
        );
        }

        if (TransformationModule.Transformations.has(this.id)) {
        console.warn(
            `Transformation "${this.id}" already registered. Skipping.`,
            this
        );
        return;
        }

        TransformationModule.Transformations.set(this.id, this);

        console.debug(
        `Transformations | Registered: ${this.id}`,
        this
        );
    }
}