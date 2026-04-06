import {
    createHideousAppearanceSaveActionGroup,
    hideousAppearanceSaveVariables
} from "./hideousAppearance.js"

export const onConcentration = {
    name: "concentration",
    variables: hideousAppearanceSaveVariables,
    actionGroups: [
        createHideousAppearanceSaveActionGroup()
    ]
}
