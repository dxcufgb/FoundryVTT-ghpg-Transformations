import { createDialogFactory } from "./dialogs/dialogFactory.js"

import { createTransformationConfigController } from "./controllers/transformationConfigController.js"
import { createTransformationStageChoiceController } from "./controllers/transformationStageChoiceController.js"
import { createTransformationPillViewModel } from "./viewModels/createTransformationPillViewModel.js"
import { createTransformationConfigViewModel } from "./viewModels/createTransformationConfigViewModel.js"
import { createTransformationStageChoiceViewModel } from "./viewModels/createTransformationStageChoiceViewModel.js"
import { createTransformationPillController } from "./controllers/transformationPillController.js"
import { createTransformationPillRenderer } from "./renderers/transformationPillRenderer.js"
import { canShowTransformationControls } from "./policies/canShowTransformationControls.js"
import { createTransformationCardViewModel } from "./viewModels/createTransformationCardViewModel.js"
import { createTransformationCardController } from "./controllers/transformationCard.controller.js"

export function createUi({
    services,
    infrastructure,
    renderTemplate,
    tracker,
    debouncedTracker,
    logger
})
{
    const { transformationService, transformationQueryService, actorQueryService } = services

    const dialogs = createDialogFactory({
        viewModels: {
            createTransformationConfigViewModel,
            createTransformationStageChoiceViewModel
        },
        controllers: {
            createTransformationConfigController,
            createTransformationStageChoiceController
        },
        transformationService,
        transformationQueryService,
        actorQueryService,
        tracker,
        logger
    })

    const pillRenderer = createTransformationPillRenderer({
        tracker,
        renderTemplate,
        templates: {
            actorTransformationPill:
                "modules/transformations/scripts/templates/components/transformation-pill.hbs"
        },
        logger
    })

    const pillController = createTransformationPillController({
        dialogs,
        logger
    })

    const cardController = createTransformationCardController({
        debouncedTracker,
        logger
    })

    return Object.freeze({
        dialogs,
        controllers: {
            pillController,
            cardController
        },
        renderers: {
            pillRenderer
        },
        viewModels: {
            createTransformationPillViewModel,
            createTransformationCardViewModel
        },
        policies: {
            canShowTransformationControls
        }

    })
}
