import {
    HIDEOUS_APPEARANCE_TRIGGER_TEXT,
    createHideousAppearanceSaveActionGroup,
    hideousAppearanceSaveVariables
} from "./hideousAppearance.js"

export const onBloodied = {
    name: "bloodied",
    variables: hideousAppearanceSaveVariables,
    actionGroups: [
        createHideousAppearanceSaveActionGroup(HIDEOUS_APPEARANCE_TRIGGER_TEXT.bloodied)
    ]
}
