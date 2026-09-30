import { isChangeTransformationAllowedForUser } from "../adapters/actorSheetControlsAdapter.js"

export function createTransformationPillController({
    dialogs,
    stageUpApprovalService,
    getGame = () => globalThis.game,
    logger
})
{
    logger.debug("createTransformationPillController", { dialogs, stageUpApprovalService })

    const pendingStageUps = new Set()

    function bind({
        app,
        pillElement,
        viewModel,
        transformation,
        transformations
    })
    {
        logger.debug("createTransformationPillController.bind", {
            app,
            pillElement,
            viewModel,
            transformation,
            transformations
        })
        if (!pillElement) return

        // Same gate as the "Change Transformation" header control: an editable sheet and a role
        // allowed by the changeTransformationAllowedRoles setting.
        if (
            viewModel.mode === "add" &&
            viewModel.editable &&
            isChangeTransformationAllowedForUser({game: getGame()})
        ) {
            pillElement.addEventListener("click", event =>
            {
                event.preventDefault()
                event.stopPropagation()

                dialogs.openTransformationConfig({
                    actor: app.actor,
                    transformations,
                    triggeringUserId: getGame()?.user?.id ?? null
                })
            })
        }

        if (viewModel.mode === "stage" && viewModel.editable) {
            const stageButton =
                pillElement.querySelector(
                    '[data-action="pill-config-stage"]'
                )

            stageButton?.addEventListener("click", async event =>
            {
                event.preventDefault()
                event.stopPropagation()

                const actor = app.actor
                if (!actor) return

                const currentStage = actor.flags?.transformations?.stage ?? 1

                const nextStage = currentStage + 1

                // A GM prompt can stay open for a while; don't stack a second request meanwhile.
                if (pendingStageUps.has(actor.id)) return
                pendingStageUps.add(actor.id)
                try {
                    const approved = await stageUpApprovalService.requestApproval({
                        actor,
                        toStage: nextStage
                    })
                    if (!approved) {
                        logger.debug("Stage up was not approved", actor.id, nextStage)
                        return
                    }
                } finally {
                    pendingStageUps.delete(actor.id)
                }

                logger.debug(
                    "Advancing transformation stage",
                    actor.id,
                    currentStage,
                    "→",
                    nextStage
                )

                await actor.update({
                    "flags.transformations.stage": nextStage
                })
            })
        }
    }

    return Object.freeze({ bind })
}
