/**
 * Domain entity.
 * No Foundry documents.
 * No UI.
 * No sockets.
 */
export class Transformation
{
    static type = "base";

    constructor({
        actorId,
        definition,
        stage = 0,
        logger = null
    })
    {
        logger?.debug?.("Transformation.constructor", {
            actorId,
            definition,
            stage
        })

        if (!actorId) {
            throw new Error("Transformation requires actorId")
        }

        if (!definition) {
            throw new Error(
                "Transformation requires TransformationDefinition"
            )
        }

        this.actorId = actorId
        this.definition = definition
        this.stage = stage
        this.logger = logger

        Object.freeze(this)
    }

    get itemId()
    {
        return this.definition.id
    }

    get name()
    {
        return this.definition.name
    }

    get img()
    {
        return this.definition.img
    }

    static onPreRollHitDie(context, actor)
    {
        this.logger?.debug?.("Transformation.onHitDieRoll", {})
    }

    static onPreRollSavingThrow(actor, context, options = {})
    {
        this.logger?.debug?.("Transformation.onSavingThrow", actor, context, options)
    }

    static async postCreateScript(actor, scriptName)
    {
        this.logger?.debug?.("Transformation.postCreateScript", actor, scriptName)
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        dialogFactory,
        logger
    })
    {
        this.logger?.debug?.(
            "Transformation.onRenderChatMessage",
            message,
            html,
            actor,
            actorRepository,
            dialogFactory,
            logger
        )
    }

    static async onActivityUse(activity, usage, message) {
        this.logger?.debug?.("Transformation.onActivityUse", activity, usage, message)
    }

    getStage()
    {
        this.logger?.debug?.("Transformation.getStage", {})
        return this.stage
    }

    getTriggerActionGroups(trigger)
    {
        this.logger?.debug?.("Transformation.getTriggerActionGroups", {trigger})
        const triggerDef =
                  this.definition.getTrigger(trigger)

        return triggerDef?.actionGroups ?? []
    }

    getTriggerVariables(trigger)
    {
        this.logger?.debug?.("Transformation.getTriggerVariables", {trigger})
        const triggerDef =
                  this.definition.getTrigger(trigger)

        return triggerDef?.variables ?? []
    }

    shouldApplyLowerRollResult(previous, current)
    {
        this.logger?.debug?.("Transformation.shouldApplyLowerRollResult", {previous, current})
        return current < previous
    }

    getRollTableName()
    {
        this.logger?.debug?.("Transformation.getRollTableName", {})
        const prefix =
                  this.definition.meta?.tablePrefix ?? ""

        return `${prefix} Stage ${this.stage}`
    }

    describeStageChange()
    {
        this.logger?.debug?.("Transformation.describeStageChange", {})
        return [
            {type: "CLEAR_TRANSFORMATION_EFFECTS"},
            {type: "APPLY_STAGE_ITEMS", stage: this.stage}
        ]
    }

    describeRollTableResult(effectName)
    {
        this.logger?.debug?.("Transformation.describeRollTableResult", {effectName})
        return [
            {type: "REMOVE_ACTIVE_EFFECTS"},
            {type: "APPLY_EFFECT", name: effectName}
        ]
    }
}
