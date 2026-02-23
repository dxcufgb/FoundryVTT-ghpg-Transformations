const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class TransformationsDebugApplication extends HandlebarsApplicationMixin(ApplicationV2)
{
    constructor (options = {})
    {
        super(options)

        const transformationApi = game.transformations
        this.transformations = transformationApi.getTransformations()
        this.logger = game.transformations.logger
        this.transformationEffects = []

        this._localState = {
            selectedActorId: null,
            selectedType: null,
            selectedEffectId: null
        }
    }

    static DEFAULT_OPTIONS = {
        id: "transformations-debug",
        classes: ["dnd5e2"],
        window: {
            title: "Transformation Roll Table Effect Debug"
        },
        position: {
            width: 500
        }
    };

    static PARTS = {
        content: {
            template: "modules/transformations/scripts/templates/applications/transformation-effect-debug-config.hbs"
        }
    };

    async _prepareContext()
    {
        const actors = game.actors.contents

        if (!this._localState.selectedActorId) {
            this._localState.selectedActorId = actors[0].id
        }

        const transformationTypes = this._getTransformationTypes()

        const { options, valueMap } = this._getEffectsForType(this._localState.selectedType)
        this.transformationEffects = valueMap

        return {
            actors,
            selectedActorId: this._localState.selectedActorId,
            transformationTypes,
            selectedType: this._localState.selectedType,
            effects: options,
            selectedEffectId: this._localState.selectedEffectId
        }
    }

    _getTransformationTypes()
    {
        const map = new Map()

        for (const transformation of this.transformations) {
            if (!map.has(transformation.itemId)) {
                map.set(transformation.itemId, transformation.TransformationClass.displayName)
            }
        }

        return [...map.entries()].map(([value, label]) => ({
            value,
            label
        }))
    }

    _getEffectsForType(type)
    {
        if (type == null || type == "") return []
        const valueMap = new Map()

        const options = Object.entries(this.transformations.find(e => e.itemId === type).TransformationRollTableEffects).map(([key, value]) =>
        {
            valueMap.set(key, value)

            return {
                value: key,
                label: this._prettifyKey(key)
            }
        })
        return { options, valueMap }
    }

    _onRender(context, options)
    {
        super._onRender(context, options)

        const html = this.element

        html.querySelector("#actor-select")?.addEventListener("change", ev =>
        {
            this._localState.selectedActorId = ev.target.value
        })

        html.querySelector("#transformation-type")?.addEventListener("change", ev =>
        {
            this._localState.selectedType = ev.target.value
            this._localState.selectedEffectId = null
            this.render() // reactive refresh
        })

        html.querySelector("#effect-select")?.addEventListener("change", ev =>
        {
            this._localState.selectedEffectId = ev.target.value
        })

        html.querySelector("#apply-effect")?.addEventListener("click", async () =>
        {
            await this._applyEffect()
        })
    }

    async _applyEffect()
    {
        const actor = game.actors.find(a => a.id == this._localState.selectedActorId)

        const transformationType = this.transformations.find(t => t.itemId == this._localState.selectedType)

        if (!actor || !transformationType) {
            this.logger.warn("Invalid actor or transformation.")
            return
        }

        const effect = game.transformations.getEffectInstance(actor, this._localState.selectedEffectId)

        this.logger.debug(
            `Removing any effect with origin ${effect.origin} from ${actor.name}`
        )

        const effectsToRemove = actor.effects
            .filter(e => e.origin == effect.origin)
            .map(e => e.id)

        if (effectsToRemove.length) {
            await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToRemove)
        }

        this.logger.debug(
            `Applying ${effect.meta.name} to ${actor.name}`
        )

        await effect.apply(actor)
    }

    _prettifyKey(key)
    {
        return key.replace(/(?!^)([A-Z])/g, " $1")
    }
}
