import {
    createHideousAppearanceSaveActionGroup,
    hideousAppearanceSaveVariables
} from "./hideousAppearance.js"

export const onBloodied = {
    name: "bloodied",
    variables: hideousAppearanceSaveVariables,
    actionGroups: [
        createHideousAppearanceSaveActionGroup()
    ]
}
