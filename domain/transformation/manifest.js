// domain/transformation/manifest.js
import * as subClasses from "./subclasses/index.js";

export function registerTransformations(registry) {
    for (const transformation of Object.values(subClasses)) {
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
