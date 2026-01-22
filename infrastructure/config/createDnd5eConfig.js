export function createDnd5eConfig({
    constants,
    transformationSubTypes
}) {
    const { TRANSFORMATION_FEATURE } = constants;

    CONFIG.DND5E.featureTypes.transformation = {
        label: TRANSFORMATION_FEATURE,
        subtypes: transformationSubTypes
    };

    CONFIG.DND5E.characterFlags.transformations = {
        type: String,
        choices: transformationSubTypes,
        name: "Transformation",
        hint: "Transformation active on the character",
        section: "Transformations"
    };

    CONFIG.DND5E.characterFlags.transformationStage = {
        type: Number,
        choices: { 1: "1", 2: "2", 3: "3", 4: "4" },
        name: "Transformation Stage",
        hint: "Stage of active transformation",
        section: "Transformations"
    };
}