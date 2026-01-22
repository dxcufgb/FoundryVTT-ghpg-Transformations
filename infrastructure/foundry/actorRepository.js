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
        clearAllMacroExecutionsForActor
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
