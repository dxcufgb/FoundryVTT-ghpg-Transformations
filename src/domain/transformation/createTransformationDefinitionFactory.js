import { TransformationDefinition } from "./TransformationDefinition.js";
import { RollTableEffectCatalog } from "../rollTable/RollTableEffectCatalog.js";

export function createTransformationDefinitionFactory({
    transformationRegistry,
    logger
}) {

    function create({
        id,
        uuid,
        item,
        TransformationClass,
        stages,
        triggers
    }) {
        if (!item) {
            logger?.warn?.(
                "Cannot create TransformationDefinition: missing item",
                { id, uuid }
            );
            return null;
        }

        if (!stages) {
            logger?.warn?.(
                "Cannot create TransformationDefinition: missing stages",
                { id }
            );
            return null;
        }

        const system = item.system ?? {};

        const rollTableEffects = createRollTableEffects(TransformationClass);

        const definition = new TransformationDefinition({
            id,
            uuid,
            item,
            stages,
            triggers: normalizeTriggers(triggers),
            rollTableEffects
        });

        definition.validate?.();

        return definition;
    }

    // ─────────────────────────────────────────────────────────────
    // Roll table effects (registry-owned)
    // ─────────────────────────────────────────────────────────────

    function createRollTableEffects(TransformationClass) {
        const entry =
            transformationRegistry.getEntryByItemId(
                TransformationClass.itemId
            );

        if (!entry?.TransformationRollTableEffects) {
            return null;
        }

        return new RollTableEffectCatalog({
            effects: entry.TransformationRollTableEffects
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Trigger normalization (item-owned)
    // ─────────────────────────────────────────────────────────────

    function normalizeTriggers(rawTriggers = {}) {
        const map = new Map();

        if (!rawTriggers || typeof rawTriggers !== "object") {
            return map;
        }

        for (const [name, trigger] of Object.entries(rawTriggers)) {
            if (!trigger) continue;

            const actions = normalizeTriggerActions(trigger.actions);
            const variables = normalizeVariables(trigger.variables);

            if (actions.length === 0) continue;

            map.set(name, { actions, variables });
        }

        return map;
    }

    function normalizeTriggerActions(actions = []) {
        if (!Array.isArray(actions)) return [];

        return actions
            .map(normalizeAction)
            .filter(Boolean);
    }

    function normalizeAction(action) {
        if (!action || typeof action !== "object") return null;
        if (!action.type) return null;

        return {
            type: action.type,
            when: normalizeWhen(action.when),
            once: normalizeOnce(action.once),
            data: normalizeData(action.data)
        };
    }

    function normalizeVariables(vars = []) {
        if (!Array.isArray(vars)) return [];

        return vars
            .map(v =>
                v && v.type
                    ? { type: v.type, name: v.name, value: v.value }
                    : null
            )
            .filter(Boolean);
    }

    function normalizeWhen(when = {}) {
        if (!when || typeof when !== "object") return undefined;

        const out = {};

        if (when.stage != null) out.stage = when.stage;
        if (when.actor) out.actor = when.actor;
        if (when.items) out.items = when.items;
        if (when.effects) out.effects = when.effects;
        if (when.saveFailed) out.saveFailed = when.saveFailed;
        if (when.saveSucceeded) out.saveSucceeded = when.saveSucceeded;

        return Object.keys(out).length ? out : undefined;
    }

    function normalizeOnce(once) {
        if (!once) return undefined;

        if (typeof once === "string") {
            return { key: once };
        }

        if (typeof once === "object" && once.key) {
            return {
                key: once.key,
                scope: once.scope,
                reset: once.reset
            };
        }

        return undefined;
    }

    function normalizeData(data) {
        if (!data || typeof data !== "object") return undefined;
        return structuredClone(data);
    }

    return Object.freeze({
        create
    });
}
