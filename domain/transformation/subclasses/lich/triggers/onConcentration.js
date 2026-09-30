import {
    HIDEOUS_APPEARANCE_TRIGGER_TEXT,
    createHideousAppearanceSaveActionGroup,
    hideousAppearanceSaveVariables
} from "./hideousAppearance.js"

export const onConcentration = {
    name: "concentration",
    variables: hideousAppearanceSaveVariables,
    actionGroups: [
        createHideousAppearanceSaveActionGroup(HIDEOUS_APPEARANCE_TRIGGER_TEXT.concentration)
    ]
}
