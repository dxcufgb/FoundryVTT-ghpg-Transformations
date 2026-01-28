import { TransformationConfigDialog } from "./TransformationConfigDialog.js";

export function createDialogFactory({
    controllers,
    viewModels,
    logger
}) {

    function openTransformationConfig({
        actor,
        transformations
    }) {
        if (!actor) {
            logger.warn(
                "openTransformationConfig called without actor"
            );
            return;
        }

        const viewModel =
            viewModels.createTransformationConfigViewModel({
                actor,
                transformations,
                logger
            });

        const dialog = new TransformationConfigDialog({
            actorId: actor.id,
            viewModel,
            controller: controllers.transformationConfigController,
            logger
        });

        dialog.render(true);
    }

    return Object.freeze({
        openTransformationConfig
    });
}
