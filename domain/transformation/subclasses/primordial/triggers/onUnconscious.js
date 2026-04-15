import {
    createRoilingElementsSaveActionGroup,
    roilingElementsSaveVariables
} from "./roilingElementsTriggerCommon.js"

export const onUnconscious = {
    name: "unconscious",
    variables: roilingElementsSaveVariables,

    actionGroups: [
        createRoilingElementsSaveActionGroup({
            name: "roiling-elements-unconscious-save",
            flavorBody: "When you gain the unconscious condition you need to roll a constitution saving throw. If you fail this save, your elemental form is revealed."
        })
    ]
}
