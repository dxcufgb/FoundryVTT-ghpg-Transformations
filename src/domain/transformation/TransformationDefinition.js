/**
 * @typedef {Object} TransformationDefinitionParams
 * @property {string} id
 * @property {string} uuid
 * @property {object} item
 * @property {Map<number, object>} stages
 * @property {Map<string, object>} triggers
 * @property {RollTableEffectCatalog} [rollTableEffects]
 */

export class TransformationDefinition
{
    constructor ({
        id,
        uuid,
        item,
        stages,
        triggers,
        rollTableEffects = null
    })
    {
        if (!id) throw new Error("TransformationDefinition requires id")
        if (!uuid) throw new Error("TransformationDefinition requires uuid")
        if (!item) throw new Error("TransformationDefinition requires item")
        if (!stages) throw new Error("TransformationDefinition requires stages")
        if (!triggers) throw new Error("TransformationDefinition requires triggers")

        this.id = id
        this.uuid = uuid

        this.name = item.name
        this.label = item.name
        this.img = item.img
        this.pack = item.pack
        this.system = item.system

        this.meta = Object.freeze({
            tablePrefix: item.flags?.transformations.tablePrefix
        })

        this.stages = stages
        this.triggers = triggers
        this.rollTableEffects = rollTableEffects

        Object.freeze(this)
    }

    getStage(stage)
    {
        return this.stages.get(stage) ?? null
    }

    getTrigger(key)
    {
        return this.triggers.get(key) ?? null
    }

    /** Optional hook for subclasses */
    validate() { }
}
