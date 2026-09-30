import {
    CANCEL_STAGE_UP_APPROVAL_EVENT,
    REQUEST_STAGE_UP_APPROVAL_EVENT
} from "../../services/transformations/createStageUpApprovalService.js"
import { EXECUTE_MACRO_EVENT } from "../../macros/createMacroExecutor.js"
import { validateMacroPayload } from "../macros/validateMacroPayload.js"
import {
    handleRoutedSavingThrow,
    ROLL_SAVING_THROW_EVENT
} from "../../services/actions/handlers/save.js"

export function registerSockets({
    socketGateway,
    transformationMutationGateway,
    createGMTransformationHandlers,
    getDialogFactory,
    getStageUpApprovalService,
    getMacros,
    logger
})
{
    logger.debug("registerSockets", {
        socketGateway,
        transformationMutationGateway,
        createGMTransformationHandlers,
        getDialogFactory
    })

    const handlers = createGMTransformationHandlers({
        gateway: transformationMutationGateway,
        logger
    })

    socketGateway.register(
        "applyTransformation",
        handlers.applyTransformation
    )

    socketGateway.register(
        "initializeTransformation",
        handlers.initializeTransformation
    )

    socketGateway.register(
        "advanceStage",
        handlers.advanceStage
    )

    socketGateway.register(
        "downgradeStage",
        handlers.downgradeStage
    )

    socketGateway.register(
        "clearTransformation",
        handlers.clearTransformation
    )

    socketGateway.register(
        "applyTriggerActions",
        handlers.applyTriggerActions
    )

    socketGateway.register(
        EXECUTE_MACRO_EVENT,
        async payload =>
        {
            logger.debug("registerSockets.executeMacro", {payload})

            if (!validateMacroPayload(payload, {logger})) {
                logger.warn("Rejected invalid macro payload from socket", payload)
                return false
            }

            const macros = getMacros?.()
            if (!macros) {
                logger.error("executeMacro requested before macros were bootstrapped", {payload})
                return false
            }

            return macros.executeMacro(payload)
        }
    )

    socketGateway.register(
        REQUEST_STAGE_UP_APPROVAL_EVENT,
        payload => getStageUpApprovalService().handleApprovalRequest(payload)
    )

    socketGateway.register(
        CANCEL_STAGE_UP_APPROVAL_EVENT,
        payload => getStageUpApprovalService().cancelApprovalRequest(payload)
    )

    socketGateway.register(
        ROLL_SAVING_THROW_EVENT,
        payload =>
        {
            logger.debug("registerSockets.rollSavingThrow", {payload})
            return handleRoutedSavingThrow(payload)
        }
    )

    socketGateway.register(
        "openDialog",
        async payload =>
        {
            logger.debug("registerSockets.openDialog", {payload})

            const dialogFactory = getDialogFactory?.()
            const methodName = payload?.methodName
            const data = await hydrateDialogData(payload?.data ?? {})
            const method = dialogFactory?.[methodName]

            if (typeof method !== "function") {
                logger.error("openDialog requested unknown dialog factory method", {
                    methodName,
                    hasDialogFactory: Boolean(dialogFactory),
                    payload
                })
                return false
            }

            if (payload?.data?.itemUuid && !data.item) {
                logger.error("openDialog could not resolve item", {
                    methodName,
                    itemUuid: payload.data.itemUuid
                })
                return false
            }

            if (payload?.data?.actorUuid && !data.actor) {
                logger.error("openDialog could not resolve actor", {
                    methodName,
                    actorUuid: payload.data.actorUuid
                })
                return false
            }

            try {
                return await method.call(dialogFactory, {
                    ...data,
                    skipUserRouting: true
                })
            } catch (error) {
                logger.error("openDialog failed", {methodName, error})
                throw error
            }
        }
    )
}

async function hydrateDialogData(data = {})
{
    const hydrated = foundry.utils.deepClone(data ?? {})
    const resolver =
              globalThis.fromUuid ??
              (typeof fromUuid === "function" ? fromUuid : null)

    if (!resolver) return hydrated

    if (hydrated.actorUuid && !hydrated.actor) {
        hydrated.actor = await resolver(hydrated.actorUuid).catch(() => null)
    }

    if (hydrated.itemUuid && !hydrated.item) {
        hydrated.item = await resolver(hydrated.itemUuid).catch(() => null)
    }

    if (Array.isArray(hydrated.choices)) {
        hydrated.choices = hydrated.choices.map(choice =>
        {
            const nextChoice = foundry.utils.deepClone(choice)
            delete nextChoice.sourceItem
            return nextChoice
        })
    }

    return hydrated
}
