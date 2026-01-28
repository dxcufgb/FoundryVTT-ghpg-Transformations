export function createActorRepository({ getGame, logger }) {

    function getById(actorId) {
        const actor = getGame().actors.get(actorId) ?? null;
        if (!actor) logger.warn("Actor not found", actorId);
        return actor;
    }

    async function getByUuid(uuid) {
        if (!uuid || typeof uuid !== "string") {
            logger?.warn?.(
                "actorRepository.getByUuid called with invalid uuid",
                uuid
            );
            return null;
        }

        let doc;
        try {
            doc = await fromUuid(uuid);
        } catch (err) {
            logger?.error?.(
                "Failed to resolve actor UUID",
                uuid,
                err
            );
            return null;
        }

        if (!doc || doc.documentName !== "Actor") {
            logger?.warn?.(
                "UUID did not resolve to Actor",
                uuid,
                doc
            );
            return null;
        }

        return doc;
    }

    function getActiveTransformationId(actor) {
        return actor?.flags?.dnd5e?.transformations ?? null;
    }

    function getTransformationStage(actor) {
        return actor?.flags?.dnd5e?.transformationStage ?? 1;
    }

    async function setTransformation(actor, transformationId, stage = 1) {
        await actor.update({
            "flags.dnd5e.transformations": transformationId,
            "flags.dnd5e.transformationStage": stage,
            "flags.transformations.fallbackActorId": actor.id
        });
    }

    async function clearTransformation(actor) {
        const updates = await getClearTransformationUpdates(actor);
        await actor.update(updates);
    }

    async function setStage(actor, stage) {
        await actor.update({
            "flags.dnd5e.transformationStage": stage
        });
    }

    function getCreatureTypeFlags(actor) {
        return actor.getFlag("transformations", "creatureTypes") ?? null;
    }

    async function setCreatureTypeFlags(actor, flags) {
        await actor.setFlag("transformations", "creatureTypes", flags);
    }

    async function clearCreatureTypeFlags(actor) {
        await actor.unsetFlag("transformations", "creatureTypes");
    }

    async function clearAllMacroExecutionsForActor(actor) {
        if (!actor?.getFlag("transformations", "macroExecutions")) return;
        await actor.unsetFlag("transformations", "macroExecutions");
    }

    async function setMacroExecution(actor, flagKey) {
        const executions =
            actor.getFlag("transformations", "macroExecutions") ?? {};

        await actor.setFlag("transformations", "macroExecutions", {
            ...executions,
            [flagKey]: true
        });

        logger?.trace?.(
            "Macro execution lock set",
            actor.id,
            flagKey
        );
    }

    async function clearMacroExecution(actor, flagKey) {
        const executions =
            actor.getFlag("transformations", "macroExecutions");

        if (!executions || !(flagKey in executions)) return;

        const { [flagKey]: _, ...remaining } = executions;

        if (Object.keys(remaining).length === 0) {
            await actor.unsetFlag(
                "transformations",
                "macroExecutions"
            );
        } else {
            await actor.setFlag(
                "transformations",
                "macroExecutions",
                remaining
            );
        }

        logger?.trace?.(
            "Macro execution lock cleared",
            actor.id,
            flagKey
        );
    }

    function hasMacroExecution(actor, flagKey) {
        const executions =
            actor.getFlag("transformations", "macroExecutions");

        return Boolean(executions?.[flagKey]);
    }

    function resolveActor(target) {
        if (!target) return null;

        // TokenDocument → synthetic actor
        if (target.documentName === "Token") {
            return target.actor ?? null;
        }

        // Token object → synthetic actor
        if (target.isToken) {
            return target.actor ?? target.parent?.actor ?? null;
        }

        // Actor
        if (target.documentName === "Actor") {
            return target;
        }

        return null;
    }

    async function addExhaustionLevels(actor, levels) {
        if (!actor) return;

        const current = Number(actor.system?.attributes?.exhaustion) || 0;

        const value = Math.clamp(current + levels, 0, 6);

        logger.debug(
            "Updating exhaustion",
            actor.id,
            current,
            "→",
            value
        );

        await actor.update({
            "system.attributes.exhaustion": value
        });
    }

    async function setActorDeathSaves(actor, saves, mode) {
        if (!actor) return;

        if (!["success", "failure"].includes(mode)) {
            throw new Error(`Invalid death save mode '${mode}'`);
        }

        const value = Math.clamp(Number(saves) || 0, 0, 3);

        await actor.update({
            [`system.attributes.death.${mode}`]: value
        });
    }

    async function setActorHp(actor, hp, type = "value") {
        if (!actor) return;

        if (!["value", "temp", "max"].includes(type)) {
            throw new Error(`Invalid HP type '${type}'`);
        }

        const path = `system.attributes.hp.${type}`;

        await actor.update({
            [path]: hp
        });
    }

    function getNumericAttributeEffectChanges(actor, {
        basePath,
        bonus,
        mode = CONST.ACTIVE_EFFECT_MODES.ADD,
        filter = v => v > 0
    }) {
        if (!actor) return [];

        const values = foundry.utils.getProperty(actor.system, basePath);
        if (!values) return [];

        const effects = [];

        for (const [key, value] of Object.entries(values)) {
            if (filter(value)) {
                effects.push({
                    key: `${basePath}.${key}`,
                    mode,
                    value: bonus
                });
            }
        }

        return effects;
    }

    async function addTempHp(actor, amount) {
        const current = actor.system.attributes.hp.temp ?? 0;
        await actor.update({
            "system.attributes.hp.temp": Math.max(current, amount)
        });
    }

    async function addHp(actor, amount) {
        const { value, max } = actor.system.attributes.hp;
        await actor.update({
            "system.attributes.hp.value": Math.min(value + amount, max)
        });
    }

    async function applyDamage(actor, amount) {
        const { value } = actor.system.attributes.hp;
        await actor.update({
            "system.attributes.hp.value": Math.max(value - amount, 0)
        });
    }

    async function setMovementBonus(actor, movementBonus) {
        await actor.update({
            "system.attributes.movement.bonus": String(movementBonus)
        })
    }

    return Object.freeze({
        getById,
        getByUuid,
        getActiveTransformationId,
        getTransformationStage,
        getCreatureTypeFlags,
        resolveActor,

        setCreatureTypeFlags,
        setTransformation,

        clearCreatureTypeFlags,
        clearTransformation,
        setStage,

        hasMacroExecution,
        setMacroExecution,
        clearMacroExecution,
        clearAllMacroExecutionsForActor,

        addExhaustionLevels,
        setActorHp,
        setActorDeathSaves,
        getNumericAttributeEffectChanges,
        addHp,
        addTempHp,
        applyDamage,
        setMovementBonus
    });

    async function getClearTransformationUpdates(actor) {
        const scope = actor.flags?.transformations;

        if (!scope || typeof scope !== "object") {
            return;
        }

        const keys = Object.keys(scope);

        if (keys.length === 0) {
            return;
        }

        const updates = {
            "flags.dnd5e.transformations": null,
            "flags.dnd5e.transformationStage": 1
        };

        for (const key of keys) {
            updates[`flags.transformations.-=${key}`] = null;
        }
        return updates;
    }
}
