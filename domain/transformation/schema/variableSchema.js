export const VariableTypes = {
    FORMULA: "formula",
    STATIC: "static",
    STAGE_DEPENDENT: "stageDependent",
    HIGHEST_AVAILABLE_HIT_DICE_MAX: "highestAvailableHitDiceMax"
};

export function isValidVariable(variable, logger = null) {
    logger?.debug?.("isValidVariable", { variable })
    if (!variable.name) return false
    if (!variable.type || !Object.values(VariableTypes).includes(variable.type)) return false

    const typesWithoutValue = [
        VariableTypes.HIGHEST_AVAILABLE_HIT_DICE_MAX
    ]

    if (
        !typesWithoutValue.includes(variable.type) &&
        variable.value == null
    ) {
        return false
    }

    return true
}
