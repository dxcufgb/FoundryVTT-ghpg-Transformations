// services/actions/effect.js

import { interpolate } from "../utils/interpolate.js"

export function createEffectAction({
    activeEffectRepository,
    tracker,
    logger
})
{
    logger.debug("createEffectAction", {
        activeEffectRepository,
        tracker
    })

    return async function EFFECT_ACTION({
        actor,
        action,
        context
    })
    {
        logger.debug("createEffectAction.EFFECT_ACTION", {
            actor,
            action,
            context
        })
        const { mode, name, active, source, uuid } = action.data ?? {}

        if (!mode) {
            logger.warn("EFFECT action missing mode", action)
            return false
        }

        if (!isValidEffectActionData({
            mode,
            name,
            uuid
        }, action)) {
            return false
        }

        return tracker.track(
            (async () =>
            {

                logger.debug(
                    "Executing EFFECT action",
                    actor.id,
                    mode,
                    name
                )

                switch (mode) {
                    case "apply":
                        await applyEffect({
                            actor,
                            name,
                            source,
                            context
                        })
                        break
                    case "create":
                        await createCustomEffect({
                            actor,
                            data: action.data,
                            context
                        })
                        break
                    case "instantiate":
                        return instantiateEffect({
                            actor,
                            uuid,
                            source,
                            context
                        })
                    case "remove":
                        await removeEffect({
                            actor,
                            name
                        })
                        break

                    case "toggle":
                        actor.toggleStatusEffect(name, { active: active })
                        break
                    default:
                        logger.warn("Unknown EFFECT action mode", mode)
                }
            })()
        )
    }

    function isValidEffectActionData({
        mode,
        name,
        uuid
    }, action)
    {
        if (mode === "instantiate") {
            if (!uuid) {
                logger.warn("EFFECT instantiate action missing uuid", action)
                return false
            }

            return true
        }

        if (!name) {
            logger.warn("EFFECT action missing name", action)
            return false
        }

        return true
    }

    async function applyEffect({
        actor,
        name,
        source,
        context
    })
    {
        logger.debug("createEffectAction.applyEffect", {
            actor,
            name,
            source,
            context
        })
        if (activeEffectRepository.hasByName(actor, name)) {
            logger.debug(
                "Effect already present, skipping",
                actor.id,
                name
            )
            return
        }

        return tracker.track(
            (async () =>
            {
                await activeEffectRepository.create({
                    actor,
                    name,
                    source: source ?? "transformation",
                    context
                })
            })()
        )
    }

    async function removeEffect({
        actor,
        name
    })
    {
        logger.debug("createEffectAction.removeEffect", { actor, name })
        const ids = activeEffectRepository.getIdsByName(actor, name)

        if (!ids.length) return

        return tracker.track(
            (async () =>
            {

                await activeEffectRepository.removeByIds(actor, ids)
            })()
        )
    }

    async function instantiateEffect({
        actor,
        uuid,
        source,
        context
    })
    {
        logger.debug("createEffectAction.instantiateEffect", {
            actor,
            uuid,
            source,
            context
        })

        if (!actor || !uuid) {
            logger.warn("Instantiate effect missing actor or uuid")
            return false
        }

        const createdEffect = await activeEffectRepository.createFromUuid({
            actor,
            uuid,
            source: source ?? "instantiated",
            context
        })

        return createdEffect != null
    }

    async function createCustomEffect({
        actor,
        data,
        context
    })
    {
        logger.debug("createEffectAction.createCustomEffect", {
            actor,
            data,
            context
        })

        if (!actor || !data?.name) {
            logger.warn("Custom effect missing actor or name")
            return
        }
        let changes = []
        for (const change of data.changes) {
            changes.push({
                key: change.key,
                mode: change.mode,
                value: interpolate(change.value, {
                    actor,
                    transformation: context.transformation,
                    variables: {}
                })
            })
        }
        const origin = interpolate(data.origin ? data.origin : "", {
            actor,
            transformation: context.transformation,
            variables: {}
        })

        const description = interpolate(data.description ? data.description : "", {
            actor,
            transformation: context.transformation,
            variables: {}
        })

        const {
            name,
            icon,
            duration = {},
            flags = {},
            source
        } = data
        return tracker.track(
            (async () =>
            {
                await activeEffectRepository.create({
                    actor,
                    name,
                    description,
                    icon,
                    changes,
                    duration,
                    flags,
                    origin,
                    source: source ?? "custom",
                    context
                })
            })()
        )
    }
}
