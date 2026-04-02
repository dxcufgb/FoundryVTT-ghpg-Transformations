import { TransformationDefinition } from "./TransformationDefinition.js"
import { RollTableEffectCatalog } from "../rollTable/RollTableEffectCatalog.js"

export function createTransformationDefinitionFactory({
    transformationRegistry,
    logger
})
{
    logger.debug("createTransformationDefinitionFactory", { transformationRegistry })

    function create({
        id,
        uuid,
        item,
        TransformationClass,
        stages,
        triggers
    })
    {
        logger.debug("createTransformationDefinitionFactory.create", {
            id,
            uuid,
            item,
            TransformationClass,
            stages,
            triggers
        })
        if (!item) {
            logger?.warn?.(
                "Cannot create TransformationDefinition: missing item",
                { id, uuid }
            )
            return null
        }

        if (!stages) {
            logger?.warn?.(
                "Cannot create TransformationDefinition: missing stages",
                { id }
            )
            return null
        }

        const rollTableEffects = createRollTableEffects(TransformationClass)

        const definition = new TransformationDefinition({
            id,
            uuid,
            item,
            stages,
            triggers: normalizeTriggers(triggers),
            rollTableEffects,
            logger
        })

        definition.validate?.()

        return definition
    }

    function createRollTableEffects(TransformationClass)
    {
        logger.debug("createTransformationDefinitionFactory.createRollTableEffects", { TransformationClass })
        const entry = transformationRegistry.getEntryByItemId(
            TransformationClass.itemId
        )

        if (!entry?.TransformationRollTableEffects) {
            return null
        }

        return new RollTableEffectCatalog({
            effects: entry.TransformationRollTableEffects,
            origin: entry.TransformationClass.rollTableOrigin,
            logger
        })
    }

    function normalizeTriggers(rawTriggers = {})
    {
        logger.debug("createTransformationDefinitionFactory.normalizeTriggers", { rawTriggers })
        const map = new Map()

        if (!rawTriggers || typeof rawTriggers !== "object") {
            return map
        }

        for (const [name, trigger] of Object.entries(rawTriggers)) {
            if (!trigger) continue

            const actionGroups = normalizeTriggerActionGroups(trigger.actionGroups)
            const variables = normalizeVariables(trigger.variables)

            if (actionGroups.length === 0) continue

            map.set(name, { actionGroups, variables })
        }

        return map
    }

    function normalizeTriggerActionGroups(rawActionGroups = [])
    {
        logger.debug(
            "createTransformationDefinitionFactory.normalizeTriggerActionGroups",
            { rawActionGroups }
        )

        if (!Array.isArray(rawActionGroups)) return []

        return rawActionGroups
            .map((group, index) =>
            {
                if (!group || typeof group !== "object") return null

                const {
                    name,
                    when,
                    once,
                    actions
                } = group

                const normalizedActions = normalizeTriggerActions(actions)
                if (!normalizedActions.length) return null

                return {
                    name: name ?? `group-${index}`,
                    when: normalizeWhen(when),
                    once: normalizeOnce(once),
                    actions: normalizedActions
                }
            })
            .filter(Boolean)
    }

    function normalizeTriggerActions(actions = [])
    {
        logger.debug("createTransformationDefinitionFactory.normalizeTriggerActions", { actions })
        if (!Array.isArray(actions)) return []

        return actions
            .map(normalizeAction)
            .filter(Boolean)
    }

    function normalizeAction(action)
    {
        logger.debug("createTransformationDefinitionFactory.normalizeAction", { action })
        if (!action || typeof action !== "object") return null
        if (!action.type) return null

        return {
            type: action.type,
            when: normalizeWhen(action.when),
            once: normalizeOnce(action.once),
            data: normalizeData(action.data)
        }
    }

    function normalizeVariables(vars = [])
    {
        logger.debug("createTransformationDefinitionFactory.normalizeVariables", { vars })
        if (!Array.isArray(vars)) return []

        return vars
            .map(v =>
                v && v.type
                    ? { type: v.type, name: v.name, value: v.value }
                    : null
            )
            .filter(Boolean)
    }

    function normalizeWhen(when = {})
    {
        logger.debug("createTransformationDefinitionFactory.normalizeWhen", { when })
        if (!when || typeof when !== "object") return undefined

        const out = {}

        if (when.stage != null) out.stage = when.stage
        if (when.actor) out.actor = when.actor
        if (when.items) out.items = when.items
        if (when.effects) out.effects = when.effects
        if (when.saveFailed) out.saveFailed = when.saveFailed
        if (when.saveSucceeded) out.saveSucceeded = when.saveSucceeded
        if (when.custom) out.custom = when.custom

        return Object.keys(out).length ? out : undefined
    }

    function normalizeOnce(once)
    {
        logger.debug("createTransformationDefinitionFactory.normalizeOnce", { once })
        if (!once) return undefined

        if (typeof once === "string") {
            return { key: once }
        }

        if (typeof once === "object" && once.key) {
            return {
                key: once.key,
                scope: once.scope,
                reset: once.reset
            }
        }

        return undefined
    }

    function normalizeData(data)
    {
        logger.debug("createTransformationDefinitionFactory.normalizeData", { data })
        if (!data || typeof data !== "object") return undefined
        return structuredClone(data)
    }

    return Object.freeze({
        create
    })
}
