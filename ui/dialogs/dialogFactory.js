import { TransformationConfigDialog } from "./TransformationConfigDialog.js"
import { TransformationChoiceDialog } from "./TransformationChoiceDialog.js"
import { TransformationGeneralChoiceDialog } from "./transformationGeneralChoiceDialog.js"
import { ItemInfoDialog } from "./ItemInfoDialog.js"
import { createItemInfoViewModel } from "../viewModels/ItemInfoViewModel.js"
import { createItemInfoController } from "../controllers/ItemInfoController.js"
import { createFeyExhaustionRecoveryViewModel } from "../viewModels/createFeyExhaustionRecoveryViewModel.js"
import { createFeyExhaustionRecoveryController } from "../controllers/feyExhaustionRecoveryController.js"
import { FeyExhaustionRecoveryDialog } from "./feyExhaustionRecoveryDialog.js"
import { createFiendGiftOfDamnationViewModel } from "../viewModels/createFiendGiftOfDamnationViewModel.js"
import { createFiendGiftOfDamnationController } from "../controllers/fiendGiftOfDamnationController.js"
import { FiendGiftOfDamnationDialog } from "./fiendGiftOfDamnationDialog.js"

export function createDialogFactory({
    activeEffectRepository,
    itemRepository,
    controllers,
    viewModels,
    transformationService,
    transformationQueryService,
    actorQueryService,
    advancementChoiceHandler,
    tracker,
    logger
})
{
    logger.debug("createDialogFactory", {
        activeEffectRepository,
        controllers,
        viewModels,
        transformationService,
        transformationQueryService,
        actorQueryService,
        tracker
    })

    function openTransformationConfig({
        actor,
        transformations
    })
    {
        logger.debug("createDialogFactory.openTransformationConfig", {
            actor,
            transformations
        })
        if (!actor) {
            logger.warn(
                "openTransformationConfig called without actor"
            )
            return false
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
        logger.debug("createDialogFactory.openStageChoiceDialog", {
            actor,
            choices,
            stage
        })
        if (!actor || !choices?.length) {
            return false
        }

        closeExistingDialog(TransformationChoiceDialog)

        return new Promise(async resolve =>
        {

            const viewModel = viewModels.createTransformationStageChoiceViewModel({
                choices,
                selectedId: null
            })

            const controller = controllers.createTransformationStageChoiceController({
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
                },
                logger
            })

            await dialog.render(true)
        })
    }

    async function openTransformationGeneralChoiceDialog({
        actor,
        choices,
        choiceCount = 1,
        description,
        title
    })
    {
        logger.debug("openTransformationGeneralChoiceDialog", {
            actor,
            choices,
            choiceCount,
            description
        })

        if (!actor || !choices?.length) {
            return false
        }

        closeExistingDialog(TransformationGeneralChoiceDialog)

        return new Promise(async resolve =>
        {
            const viewModel = viewModels.createTransformationGeneralChoiceViewModel({
                choices,
                choiceCount,
                description,
                title,
                logger
            })

            const controller = controllers.createTransformationGeneralChoiceController({
                actor,
                resolve,
                logger
            })

            const dialog = new TransformationGeneralChoiceDialog({
                actor,
                viewModel,
                controller,
                options: {
                    id: `transformation-general-choice-${actor.id}`,
                    title: viewModel.title
                },
                logger
            })

            await dialog.render(true)
        })
    }

    async function showItemInfoDialog({item})
    {
        logger.debug("openDamageTypeChoiceDialog", {
            item
        })

        if (!item) {
            return false
        }

        closeExistingDialog(ItemInfoDialog)

        return new Promise(resolve =>
        {
            const viewModel = createItemInfoViewModel({item, logger})
            const controller = createItemInfoController({resolve, logger})

            const dialog = new ItemInfoDialog({
                item,
                viewModel,
                controller,
                logger
            })

            dialog.render(true)
        })
    }

    async function openFeyExhaustionRecovery({
        stage,
        exhaustion,
        hitDiceAvailable
    })
    {
        logger.debug("openFeyExhaustionRecovery", {
            stage,
            exhaustion,
            hitDiceAvailable
        })
        return new Promise(resolve =>
        {

            const viewModel =
                      createFeyExhaustionRecoveryViewModel({
                          stage,
                          exhaustion,
                          hitDiceAvailable,
                          logger
                      })

            const controller =
                      createFeyExhaustionRecoveryController({
                          resolve,
                          logger
                      })

            const dialog =
                      new FeyExhaustionRecoveryDialog({
                          viewModel,
                          controller,
                          logger
                      })

            dialog.render(true)
        })
    }

    async function openFiendGiftOfDamnation({
        actor,
        stage
    })
    {
        logger.debug("openFiendGiftOfDamnation", {
            actor,
            stage
        })

        if (!actor) return false

        closeExistingDialog(FiendGiftOfDamnationDialog)

        return new Promise(resolve =>
        {
            const viewModel =
                      createFiendGiftOfDamnationViewModel({
                          actor,
                          stage,
                          logger
                      })

            const controller =
                      createFiendGiftOfDamnationController({
                          actor,
                          activeEffectRepository,
                          itemRepository,
                          advancementChoiceHandler,
                          resolve,
                          logger
                      })

            const dialog = new FiendGiftOfDamnationDialog({
                viewModel,
                controller,
                logger
            })

            dialog.render(true)
        })
    }

    return Object.freeze({
        openTransformationConfig,
        openStageChoiceDialog,
        openTransformationGeneralChoiceDialog,
        showItemInfoDialog,
        openFeyExhaustionRecovery,
        openFiendGiftOfDamnation
    })

    function closeExistingDialog(dialog)
    {
        logger.debug("createDialogFactory.closeExistingDialog", {dialog})
        for (const app of Object.values(ui.windows)) {
            if (app instanceof dialog) {
                app.close({force: true})
            }
        }
    }
}
