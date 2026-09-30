import {
    HIDEOUS_APPEARANCE_TRIGGER_TEXT,
    createHideousAppearanceSaveActionGroup,
    hideousAppearanceSaveVariables
} from "./hideousAppearance.js"

export const onUnconscious = {
    name: "unconscious",
    variables: hideousAppearanceSaveVariables,
    actionGroups: [
        createHideousAppearanceSaveActionGroup(HIDEOUS_APPEARANCE_TRIGGER_TEXT.unconscious)
    ]
}
