export const ASK_GM_BEFORE_STAGE_UP_SETTING = "askGmBeforeStageUp"
export const REQUEST_STAGE_UP_APPROVAL_EVENT = "requestStageUpApproval"
export const CANCEL_STAGE_UP_APPROVAL_EVENT = "cancelStageUpApproval"

/** What the GM side reports back to the requesting player. */
export const STAGE_UP_OUTCOME = Object.freeze({
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
    UNRESOLVED: "unresolved"
})

/**
 * Lets the GM veto a player's transformation stage up.
 *
 * Player side: requestApproval() runs before the stage flag is written. It shows a waiting
 *              dialog with an abort button while the GM decides, and a dialog when it is rejected.
 * GM side:     handleApprovalRequest() shows the decision dialog and reports the outcome.
 *              cancelApprovalRequest() removes that dialog again when the player aborts.
 */
export function createStageUpApprovalService({
    moduleId,
    getGame,
    socketGateway,
    getDialogFactory,
    notifier,
    transformationRegistry,
    logger
})
{
    logger.debug("createStageUpApprovalService", {
        moduleId,
        getGame,
        socketGateway,
        getDialogFactory,
        notifier,
        transformationRegistry
    })

    // GM side bookkeeping, keyed by requestId.
    const pendingRequests = new Set()
    const cancelledRequests = new Set()

    function isApprovalRequired(user = getGame().user)
    {
        logger.debug("createStageUpApprovalService.isApprovalRequired", { user })
        if (!user || user.isGM) return false
        return getGame().settings.get(moduleId, ASK_GM_BEFORE_STAGE_UP_SETTING) === true
    }

    /**
     * @returns {Promise<boolean>} true when the stage up may proceed.
     */
    async function requestApproval({ actor, toStage, user = getGame().user })
    {
        logger.debug("createStageUpApprovalService.requestApproval", { actor, toStage, user })
        if (!isApprovalRequired(user)) return true

        // One GM handles the request and the abort, so both always reach the same client.
        const gm = getGame().users.activeGM
        if (!gm) {
            notifier.warn("A GM must be online to approve a transformation stage up.")
            return false
        }

        const requestId = foundry.utils.randomID()
        const waitingDialog = getDialogFactory().openStageUpWaitingDialog()

        try {
            const request = socketGateway.executeAsUser(REQUEST_STAGE_UP_APPROVAL_EVENT, gm.id, {
                requestId,
                actorUuid: actor.uuid,
                requestingUserId: user.id,
                toStage
            })
            // If the player aborts, the request settles later; that result is no longer wanted.
            request.catch(() => {})

            const outcome = await Promise.race([
                request.then(result => ({ result })),
                waitingDialog.aborted.then(() => ({ aborted: true }))
            ])

            if (outcome.aborted) {
                await socketGateway
                .executeAsUser(CANCEL_STAGE_UP_APPROVAL_EVENT, gm.id, { requestId })
                .catch(error => logger.warn("Could not cancel stage up approval request", error))
                return false
            }

            const result = outcome.result?.outcome
            if (result === STAGE_UP_OUTCOME.REJECTED) {
                showRejection(actor)
            }
            if (result === STAGE_UP_OUTCOME.UNRESOLVED) {
                notifier.warn("The stage up request could not be processed.")
            }
            return result === STAGE_UP_OUTCOME.APPROVED
        } catch (error) {
            logger.error("Stage up approval request failed", error)
            notifier.error("The stage up approval request failed.")
            return false
        } finally {
            waitingDialog.close()
        }
    }

    function showRejection(actor)
    {
        const transformationName =
                  transformationRegistry.getEntryForActor(actor)?.TransformationClass?.displayName
                  ?? "Unknown"
        // Not awaited: the player dismisses it with OK whenever they like.
        getDialogFactory()
        .openStageUpRejectedDialog({ characterName: actor.name, transformationName })
        .catch(error => logger.warn("Could not show the stage up rejection dialog", error))
    }

    async function handleApprovalRequest({ requestId, actorUuid, requestingUserId, toStage } = {})
    {
        logger.debug("createStageUpApprovalService.handleApprovalRequest", {
            requestId,
            actorUuid,
            requestingUserId,
            toStage
        })
        const actor = await fromUuid(actorUuid)
        const requestingUser = getGame().users.get(requestingUserId)
        if (!actor || !requestingUser) {
            logger.warn("Stage up approval request could not be resolved", {
                actorUuid,
                requestingUserId
            })
            return { outcome: STAGE_UP_OUTCOME.UNRESOLVED }
        }

        // The player may have aborted before the dialog could open.
        if (cancelledRequests.delete(requestId)) return { outcome: STAGE_UP_OUTCOME.CANCELLED }

        const transformationName =
                  transformationRegistry.getEntryForActor(actor)?.TransformationClass?.displayName
                  ?? "Unknown"

        pendingRequests.add(requestId)
        let approved
        try {
            approved = await getDialogFactory().openStageUpApprovalDialog({
                requestId,
                requestingUserName: requestingUser.name,
                characterName: actor.name,
                transformationName,
                toStage
            })
        } finally {
            pendingRequests.delete(requestId)
        }

        // The player aborted while the dialog was open, so there is nobody left to answer.
        if (cancelledRequests.delete(requestId)) return { outcome: STAGE_UP_OUTCOME.CANCELLED }

        // A dismissed dialog (null) counts as a rejection.
        return {
            outcome: approved === true
                ? STAGE_UP_OUTCOME.APPROVED
                : STAGE_UP_OUTCOME.REJECTED
        }
    }

    function cancelApprovalRequest({ requestId } = {})
    {
        logger.debug("createStageUpApprovalService.cancelApprovalRequest", { requestId })
        if (!requestId) return false

        // Also remembered when the request hasn't been shown yet, so it is skipped when it arrives.
        cancelledRequests.add(requestId)
        if (pendingRequests.has(requestId)) {
            getDialogFactory().closeStageUpApprovalDialog(requestId)
        }
        return true
    }

    return Object.freeze({
        isApprovalRequired,
        requestApproval,
        handleApprovalRequest,
        cancelApprovalRequest
    })
}
