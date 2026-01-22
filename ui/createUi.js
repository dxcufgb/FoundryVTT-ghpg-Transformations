import { createDialogFactory } from "./dialogs/dialogFactory.js";

import { createTransformationConfigController } from "./controllers/transformationConfigController.js";
import { createTransformationPillViewModel } from "./viewModels/createTransformationPillViewModel.js";
import { createTransformationConfigViewModel } from "./viewModels/createTransformationConfigViewModel.js";
import { createTransformationPillController } from "./controllers/transformationPillController.js";
import { createTransformationPillRenderer } from "./renderers/transformationPillRenderer.js";
import { canShowTransformationControls } from "./policies/canShowTransformationControls.js";

export function createUi({
    services,
    infrastructure,
    renderTemplate,
    logger
}) {
    const { transformationService, transformationQueryService, actorQueryService } = services
    // ─────────────────────────────────────────────────────────────
    // Controllers
    // ─────────────────────────────────────────────────────────────

    const transformationConfigController = createTransformationConfigController({
        transformationService,
        transformationQueryService: transformationQueryService,
        actorQueryService,
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // Dialogs
    // ─────────────────────────────────────────────────────────────

    const dialogs = createDialogFactory({
        viewModels: {
            createTransformationConfigViewModel
        },
        controllers: {
            transformationConfigController
        },
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // UI helpers
    // ─────────────────────────────────────────────────────────────

    const pillRenderer = createTransformationPillRenderer({
        renderTemplate,
        templates: {
            actorTransformationPill:
                "modules/transformations/scripts/templates/components/transformation-pill.hbs"
        },
        logger
    });

    const pillController = createTransformationPillController({
        dialogs,
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // Public UI surface
    // ─────────────────────────────────────────────────────────────

    return Object.freeze({
        dialogs,
        controllers: {
            pillController
        },
        renderers: {
            pillRenderer
        },
        viewModels: {
            createTransformationPillViewModel
        },
        policies: {
            canShowTransformationControls
        }

    });
}
