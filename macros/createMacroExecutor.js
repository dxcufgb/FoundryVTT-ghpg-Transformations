// infrastructure/macros/createMacroExecutor.js
import { validateMacroPayload } from "../infrastructure/macros/validateMacroPayload.js"
import { withMacroExecutionLock } from "../infrastructure/macros/withMacroExecutionLock.js"

export function createMacroExecutor({
    actorRepository,
    tokenRepository,
    itemRepository,
    socketGateway,
    activeEffectRepository,
    macroRegistry,
    macroContextFactory,
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

                if (socketGateway.canMutateLocally()) {
                    return executeMacro(payload)
                }

                socketGateway.emit("EXECUTE_MACRO", payload)
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

                const actor = await actorRepository.getByUuid(
                    payload.args.actorUuid
                )
                const token = await tokenRepository.getByUuid(
                    payload.args.tokenUuid
                )

                if (!actor || !token) {
                    logger.warn(
                        "Macro execution failed: actor or token missing",
                        payload
                    )
                    return
                }

                const { trigger, transformationType, action } = payload

                const entry = macroRegistry.get(transformationType)
                if (!entry) {
                    notify.warn(`Unknown transformation: ${transformationType}`)
                    return
                }

                const handlers = entry.createHandlers({
                    logger,
                    activeEffectRepository,
                    itemRepository,
                    tracker
                })

                const handler = handlers[action]

                if (typeof handler !== "function") {
                    notify.warn(
                        `Action '${action}' not supported by ${transformationType}`
                    )
                    return
                }

                const context =
                    macroContextFactory.createFromToken(token)

                if (!context) return

                await withMacroExecutionLock(
                    {
                        actor,
                        transformationType,
                        action,
                        trigger,
                        logger
                    },
                    async () =>
                    {
                        await handler({
                            actor,
                            token,
                            trigger,
                            context
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
