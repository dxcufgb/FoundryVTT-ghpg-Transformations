export const VariableTypes = {
    FORMULA: "formula"
};

export function isValidVariable(variable, logger = null) {
    logger?.debug?.("isValidVariable", { variable })
    if (!variable.name) return false;
    if (!variable.type || !Object.values(VariableTypes).includes(variable.type)) return false;
    if (!variable.value) return false;
    return true;
}
