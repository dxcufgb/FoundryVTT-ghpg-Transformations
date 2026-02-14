/**
 * Domain entity.
 * No Foundry documents.
 * No UI.
 * No logging.
 * No sockets.
 */
export class Transformation
{
    static type = "base";

    constructor ({
        actorId,
        definition,
        stage = 0
    })
    {
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

    getStage()
    {
        return this.stage
    }

    getTriggerActions(trigger)
    {
        const triggerDef =
            this.definition.getTrigger(trigger)

        return triggerDef?.actions ?? []
    }

    getTriggerVariables(trigger)
    {
        const triggerDef =
            this.definition.getTrigger(trigger)

        return triggerDef?.variables ?? []
    }

    shouldApplyLowerRollResult(previous, current)
    {
        return current < previous
    }

    getRollTableName()
    {
        const prefix =
            this.definition.meta?.tablePrefix ?? ""

        return `${prefix} Stage ${this.stage}`
    }

    describeStageChange()
    {
        return [
            { type: "CLEAR_TRANSFORMATION_EFFECTS" },
            { type: "APPLY_STAGE_ITEMS", stage: this.stage }
        ]
    }

    describeRollTableResult(effectName)
    {
        return [
            { type: "REMOVE_ACTIVE_EFFECTS" },
            { type: "APPLY_EFFECT", name: effectName }
        ]
    }

    onDamage() { }
    onShortRest() { }
    onLongRest() { }
    onInitiative() { }
    onConcentration() { }
    onHitDieRoll() { }
    onSavingThrow() { }
    onBloodied() { }
    onUnconscious() { }
}
