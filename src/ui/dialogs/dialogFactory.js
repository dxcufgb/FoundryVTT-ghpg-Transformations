import { TransformationConfigDialog } from "./TransformationConfigDialog.js"
import { TransformationChoiceDialog } from "./TransformationChoiceDialog.js"

export function createDialogFactory({
    controllers,
    viewModels,
    transformationService,
    transformationQueryService,
    actorQueryService,
    tracker,
    logger
})
{
    function openTransformationConfig({
        actor,
        transformations
    })
    {
        if (!actor) {
            logger.warn(
                "openTransformationConfig called without actor"
            )
            return
        }

        closeExistingDialog(TransformationConfigDialog)

        const viewModel = viewModels.createTransformationConfigViewModel({
            actor,
            transformations,
            logger
        })

        const controller = controllers.createTransformationConfigController({
            transformationService,
            transformationQueryService,
            actorQueryService,
            tracker,
            logger
        })

        const dialog = new TransformationConfigDialog({
            actorUuid: actor.uuid,
            viewModel,
            controller,
            options: {
                id: `transformation-config-${actor.id}`
            },
            logger
        })

        dialog.render(true)
    }

    async function openStageChoiceDialog({
        actor,
        choices,
        stage
    })
    {
        if (!actor || !choices?.length) {
            return undefined
        }

        closeExistingDialog(TransformationChoiceDialog)

        return new Promise(async resolve =>
        {

            const viewModel =
                viewModels.createTransformationStageChoiceViewModel({
                    choices,
                    selectedId: null
                })

            const controller =
                controllers.createTransformationStageChoiceController({
                    actor,
                    resolve,
                    logger
                })

            const dialog = new TransformationChoiceDialog({
                actor,
                viewModel,
                controller,
                options: {
                    id: `transformation-choice-dialog-${actor.id}-stage-${stage}`
                }
            })

            await dialog.render(true)
        })
    }



    return Object.freeze({
        openTransformationConfig,
        openStageChoiceDialog
    })

    function closeExistingDialog(dialog)
    {
        for (const app of Object.values(ui.windows)) {
            if (app instanceof dialog) {
                app.close({ force: true })
            }
        }
    }
}