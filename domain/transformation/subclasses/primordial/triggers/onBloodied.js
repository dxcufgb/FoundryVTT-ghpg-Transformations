import {
    createRoilingElementsSaveActionGroup,
    roilingElementsSaveVariables
} from "./roilingElementsTriggerCommon.js"

export const onBloodied = {
    name: "bloodied",
    variables: roilingElementsSaveVariables,

    actionGroups: [
        createRoilingElementsSaveActionGroup({
            name: "roiling-elements-bloodied-save",
            flavorBody: "When you become bloodied you need to roll a constitution saving throw. If you fail this save, your elemental form is revealed."
        })
    ]
}
