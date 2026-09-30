// infrastructure/macros/createMacroExecutor.js
import { validateMacroPayload } from "../infrastructure/macros/validateMacroPayload.js"
import { withMacroExecutionLock } from "../infrastructure/macros/withMacroExecutionLock.js"

export const EXECUTE_MACRO_EVENT = "executeMacro"
export const USE_ACTIVITY_EVENT = "useActivity"

export function createMacroExecutor({
    actorRepository,
    tokenRepository,
    itemRepository,
    socketGateway,
    activeEffectRepository,
    macroRegistry,
    macroContextFactory,
    getDialogFactory = () => null,
    tracker,
    logger,
    notify
})
{
    logger.debug("createMacroExecutor", {
        actorRepository,
        tokenRepository,
        itemRepository,
        socketGateway,
        activeEffectRepository,
        macroRegistry,
        macroContextFactory,
        tracker,
        notify
    })

    async function macroWrapper(payload)
    {
        logger.debug("createMacroExecutor.macroWrapper", { payload })
        return tracker.track(
            (async () =>
            {
                logger.debug("macroWrapper called", payload)

                const routedPayload = {
                    ...payload,
                    triggeringUserId: payload?.triggeringUserId ?? game.user?.id ?? null
                }

                if (socketGateway.canMutateLocally()) {
                    return executeMacro(routedPayload)
                }

                if (!socketGateway.isGMOnline()) {
                    notify.warn("A GM must be online for this transformation ability to take effect.")
                    return
                }

                return socketGateway.executeAsGM(EXECUTE_MACRO_EVENT, routedPayload)
            })()
        )
    }

    async function executeMacro(payload)
    {
        logger.debug("createMacroExecutor.executeMacro", { payload })
        return tracker.track(
            (async () =>
            {
                if (!socketGateway.canMutateLocally()) return

                if (!validateMacroPayload(payload, { logger })) {
                    logger.warn("Macro execution aborted due to invalid payload")
                    return
                }

                const actor = await actorRepository.getByUuid(payload.args.actorUuid)
                // The token is optional: the actor may have no token on the current scene.
                const token = payload.args.tokenUuid
                    ? await tokenRepository.getByUuid(payload.args.tokenUuid)
                    : null
                const effect = payload.args.efData

                if (!actor) {
                    logger.warn(
                        "Macro execution failed: actor missing",
                        payload
                    )
                    return
                }

                const { trigger, transformationType, action, triggeringUserId = null } = payload

                const entry = macroRegistry.get(transformationType)
                if (!entry) {
                    notify.warn(`Unknown transformation: ${transformationType}`)
                    return
                }

                const handlers = entry.createHandlers({
                    logger,
                    activeEffectRepository,
                    itemRepository,
                    getDialogFactory,
                    // Runs an activity on another user's client so its dialogs appear there.
                    useActivityAsUser: ({ activityUuid, userId }) =>
                        socketGateway.executeAsUser(USE_ACTIVITY_EVENT, userId, { activityUuid }),
                    tracker
                })

                const handler = handlers[action]

                if (typeof handler !== "function") {
                    notify.warn(
                        `Action '${action}' not supported by ${transformationType}`
                    )
                    return
                }

                const context = token
                    ? macroContextFactory.createFromToken(token)
                    : null

                await withMacroExecutionLock(
                    {
                        actor,
                        transformationType,
                        action,
                        trigger,
                        effect,
                        logger
                    },
                    async () =>
                    {
                        await handler({
                            actor,
                            token,
                            trigger,
                            effect,
                            context,
                            triggeringUserId
                        })
                    },
                    {
                        actorRepository
                    }
                )
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        macroWrapper,
        executeMacro
    })
}
