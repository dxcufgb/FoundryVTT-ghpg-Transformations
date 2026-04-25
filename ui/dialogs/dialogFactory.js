import { TransformationConfigDialog } from "./TransformationConfigDialog.js"
import { TransformationChoiceDialog } from "./TransformationChoiceDialog.js"
import { TransformationGeneralChoiceDialog } from "./transformationGeneralChoiceDialog.js"
import { AbilityScoreAdvancementDialog } from "./AbilityScoreAdvancementDialog.js"
import { ItemInfoDialog } from "./ItemInfoDialog.js"
import { createItemInfoViewModel } from "../viewModels/ItemInfoViewModel.js"
import { createItemInfoController } from "../controllers/ItemInfoController.js"
import { createAbilityScoreAdvancementViewModel } from "../viewModels/createAbilityScoreAdvancementViewModel.js"
import { createAbilityScoreAdvancementController } from "../controllers/abilityScoreAdvancementController.js"
import { createFeyExhaustionRecoveryViewModel } from "../viewModels/createFeyExhaustionRecoveryViewModel.js"
import { createFeyExhaustionRecoveryController } from "../controllers/feyExhaustionRecoveryController.js"
import { FeyExhaustionRecoveryDialog } from "./feyExhaustionRecoveryDialog.js"
import { createFiendGiftOfDamnationViewModel } from "../viewModels/createFiendGiftOfDamnationViewModel.js"
import { createFiendGiftOfDamnationController } from "../controllers/fiendGiftOfDamnationController.js"
import { FiendGiftOfDamnationDialog } from "./fiendGiftOfDamnationDialog.js"
import { createFiendUnbridledPowerSpellSlotRecoveryViewModel } from "../viewModels/createFiendUnbridledPowerSpellSlotRecoveryViewModel.js"
import { createHagSpellRecoveryViewModel } from "../viewModels/createHagSpellRecoveryViewModel.js"
import { createTransformationsSpellSlotRecoveryViewModel } from "../viewModels/createTransformationsSpellSlotRecoveryViewModel.js"
import { createTransformationsSpellSlotRecoveryController } from "../controllers/transformationsSpellSlotRecoveryController.js"
import { TransformationsSpellSlotRecoveryDialog } from "./transformationsSpellSlotRecoveryDialog.js"

const ROUTE_LOCALLY = Symbol("ROUTE_LOCALLY")

export function createDialogFactory({
    applyFiendGiftOfDamnation,
    socketGateway,
    controllers,
    viewModels,
    transformationService,
    transformationQueryService,
    actorQueryService,
    tracker,
    logger
})
{
    logger.debug("createDialogFactory", {
        applyFiendGiftOfDamnation,
        socketGateway,
        controllers,
        viewModels,
        transformationService,
        transformationQueryService,
        actorQueryService,
        tracker
    })

    async function openTransformationConfig({
        actor,
        transformations,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("createDialogFactory.openTransformationConfig", {
            actor,
            transformations,
            triggeringUserId,
            skipUserRouting
        })
        if (!actor) {
            logger.warn("openTransformationConfig called without actor")
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openTransformationConfig",
            data: {
                actor,
                transformations,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
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
        return dialog
    }

    async function openStageChoiceDialog({
        actor,
        choices,
        choiceCount = 1,
        stage,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("createDialogFactory.openStageChoiceDialog", {
            actor,
            choices,
            choiceCount,
            stage,
            triggeringUserId,
            skipUserRouting
        })
        if (!actor || !choices?.length) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openStageChoiceDialog",
            data: {
                actor,
                choices,
                choiceCount,
                stage,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(TransformationChoiceDialog)

        return new Promise(async resolve =>
        {
            const viewModel = viewModels.createTransformationStageChoiceViewModel({
                choices,
                selectedIds: [],
                choiceCount
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
        title,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openTransformationGeneralChoiceDialog", {
            actor,
            choices,
            choiceCount,
            description,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor || !choices?.length) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openTransformationGeneralChoiceDialog",
            data: {
                actor,
                choices,
                choiceCount,
                description,
                title,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
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

    async function openAbilityScoreAdvancementDialog({
        actor,
        advancementConfiguration = {},
        title = "Allocate Ability Scores",
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openAbilityScoreAdvancementDialog", {
            actor,
            advancementConfiguration,
            title,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openAbilityScoreAdvancementDialog",
            data: {
                actor,
                advancementConfiguration,
                title,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(AbilityScoreAdvancementDialog)

        return new Promise(resolve =>
        {
            const viewModel = createAbilityScoreAdvancementViewModel({
                actor,
                advancementConfiguration,
                title,
                logger
            })

            const controller = createAbilityScoreAdvancementController({
                resolve,
                logger
            })

            const dialog = new AbilityScoreAdvancementDialog({
                actor,
                viewModel,
                controller,
                options: {
                    id: `ability-score-advancement-${actor.id}`,
                    title: viewModel.title
                },
                logger
            })

            dialog.render(true)
        })
    }

    async function showItemInfoDialog({
        item,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openDamageTypeChoiceDialog", {
            item,
            triggeringUserId,
            skipUserRouting
        })

        if (!item) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "showItemInfoDialog",
            data: {
                item,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
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
        hitDiceAvailable,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openFeyExhaustionRecovery", {
            stage,
            exhaustion,
            hitDiceAvailable,
            triggeringUserId,
            skipUserRouting
        })

        const routingResult = await routeDialogOpen({
            methodName: "openFeyExhaustionRecovery",
            data: {
                stage,
                exhaustion,
                hitDiceAvailable,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        return new Promise(resolve =>
        {
            const viewModel = createFeyExhaustionRecoveryViewModel({
                stage,
                exhaustion,
                hitDiceAvailable,
                logger
            })

            const controller = createFeyExhaustionRecoveryController({
                resolve,
                logger
            })

            const dialog = new FeyExhaustionRecoveryDialog({
                viewModel,
                controller,
                logger
            })

            dialog.render(true)
        })
    }

    async function openFiendGiftOfDamnation({
        actor,
        stage,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openFiendGiftOfDamnation", {
            actor,
            stage,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor) return false

        const routingResult = await routeDialogOpen({
            methodName: "openFiendGiftOfDamnation",
            data: {
                actor,
                stage,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(FiendGiftOfDamnationDialog)

        return new Promise(resolve =>
        {
            const viewModel = createFiendGiftOfDamnationViewModel({
                actor,
                stage,
                logger
            })

            const controller = createFiendGiftOfDamnationController({
                actor,
                applyFiendGiftOfDamnation,
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

    async function openFiendUnbridledPowerSpellSlotRecovery({
        actor,
        amount,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openFiendUnbridledPowerSpellSlotRecovery", {
            actor,
            amount,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openFiendUnbridledPowerSpellSlotRecovery",
            data: {
                actor,
                amount,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(TransformationsSpellSlotRecoveryDialog)

        return new Promise(resolve =>
        {
            const viewModel = createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                actor,
                amount: Number(amount),
                logger
            })

            const controller = createTransformationsSpellSlotRecoveryController({
                resolve,
                logger
            })

            const dialog = new TransformationsSpellSlotRecoveryDialog({
                viewModel,
                controller,
                logger
            })

            dialog.render(true)
        })
    }

    async function openTransformationsSpellSlotRecovery({
        actor,
        title = "Recover Spell Slots",
        description = null,
        confirmLabel = "Restore",
        cancelLabel = "Cancel",
        emptyMessage = "No spent spell slots can be recovered.",
        selectionMode = "single",
        maxRecoverableLevel = 9,
        maxRecoverableCost = Number.POSITIVE_INFINITY,
        useEntryGroupLabel = true,
        summaryStats = [],
        selectionSummary = null,
        classPrefix = "transformations-spell-slot-recovery",
        dialogClassName = "transformations-spell-slot-recovery-dialog",
        inputName = "transformations-spell-slot-recovery-choice",
        extraContext = {},
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openTransformationsSpellSlotRecovery", {
            actor,
            title,
            selectionMode,
            maxRecoverableLevel,
            maxRecoverableCost,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openTransformationsSpellSlotRecovery",
            data: {
                actor,
                title,
                description,
                confirmLabel,
                cancelLabel,
                emptyMessage,
                selectionMode,
                maxRecoverableLevel,
                maxRecoverableCost,
                useEntryGroupLabel,
                summaryStats,
                selectionSummary,
                classPrefix,
                dialogClassName,
                inputName,
                extraContext,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(TransformationsSpellSlotRecoveryDialog)

        return new Promise(resolve =>
        {
            const viewModel = createTransformationsSpellSlotRecoveryViewModel({
                actor,
                title,
                description,
                confirmLabel,
                cancelLabel,
                emptyMessage,
                selectionMode,
                maxRecoverableLevel,
                maxRecoverableCost,
                useEntryGroupLabel,
                summaryStats,
                selectionSummary,
                classPrefix,
                dialogClassName,
                inputName,
                extraContext,
                logger
            })

            const controller = createTransformationsSpellSlotRecoveryController({
                resolve,
                logger
            })

            const dialog = new TransformationsSpellSlotRecoveryDialog({
                viewModel,
                controller,
                logger
            })

            dialog.render(true)
        })
    }

    async function openHagSpellRecovery({
        actor,
        triggeringUserId = null,
        skipUserRouting = false
    })
    {
        logger.debug("openHagSpellRecovery", {
            actor,
            triggeringUserId,
            skipUserRouting
        })

        if (!actor) {
            return false
        }

        const routingResult = await routeDialogOpen({
            methodName: "openHagSpellRecovery",
            data: {
                actor,
                triggeringUserId,
                skipUserRouting
            }
        })
        if (routingResult !== ROUTE_LOCALLY) {
            return routingResult
        }

        closeExistingDialog(TransformationsSpellSlotRecoveryDialog)

        return new Promise(resolve =>
        {
            const viewModel = createHagSpellRecoveryViewModel({
                actor,
                logger
            })

            const controller = createTransformationsSpellSlotRecoveryController({
                resolve,
                logger
            })

            const dialog = new TransformationsSpellSlotRecoveryDialog({
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
        openAbilityScoreAdvancementDialog,
        showItemInfoDialog,
        openFeyExhaustionRecovery,
        openFiendGiftOfDamnation,
        openFiendUnbridledPowerSpellSlotRecovery,
        openTransformationsSpellSlotRecovery,
        openHagSpellRecovery
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

    async function routeDialogOpen({
        methodName,
        data
    } = {})
    {
        const targetUserId = normalizeUserId(data?.triggeringUserId)

        if (!targetUserId || data?.skipUserRouting === true) {
            return ROUTE_LOCALLY
        }

        if (targetUserId === game.user?.id) {
            return ROUTE_LOCALLY
        }

        if (!socketGateway?.isReady?.() || typeof socketGateway.executeAsUser !== "function") {
            logger.warn("Dialog routing requested before socket gateway was ready", {
                methodName,
                targetUserId
            })
            return false
        }

        return socketGateway.executeAsUser("openDialog", targetUserId, {
            methodName,
            data: serializeDialogData({
                ...data,
                skipUserRouting: true
            })
        })
    }
}

function normalizeUserId(userId)
{
    return typeof userId === "string" && userId.length > 0
        ? userId
        : null
}

function serializeDialogData(data = {})
{
    const serialized = {
        ...(data ?? {})
    }

    if (data?.actor?.uuid) {
        serialized.actorUuid = data.actor.uuid
        delete serialized.actor
    }

    if (data?.item?.uuid) {
        serialized.itemUuid = data.item.uuid
        delete serialized.item
    }

    if (Array.isArray(serialized.choices)) {
        serialized.choices = serialized.choices.map(choice =>
        {
            const nextChoice = foundry.utils.deepClone(choice)
            delete nextChoice.sourceItem
            return nextChoice
        })
    }

    return serialized
}
