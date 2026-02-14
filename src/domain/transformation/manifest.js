// domain/transformation/manifest.js
import * as subClasses from "./subclasses/index.js";

export function registerTransformations(registry, logger = null) {
    logger?.debug?.("registerTransformations", { registry, subClasses })
    for (const transformation of Object.values(subClasses)) {
        logger?.debug?.("registerTransformations.register", { transformation })
        registry.register({
            uuid: transformation.Class.uuid,
            TransformationClass: transformation.Class,
            TransformationDefinition: transformation.Definition,
            TransformationStages: transformation.Stages,
            TransformationTriggers: transformation.Triggers,
            TransformationRollTableEffects: transformation.Effects,
            TransformationMacros: transformation.Macros
        });
    }
}
