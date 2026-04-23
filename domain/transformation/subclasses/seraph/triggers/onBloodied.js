import {
    createBlindingRadianceSaveActionGroup,
    blindingRadianceSaveVariables
} from "./blindingRadianceTriggerCommon.js"

export const onBloodied = {
    name: "bloodied",
    variables: blindingRadianceSaveVariables,

    actionGroups: [
        createBlindingRadianceSaveActionGroup({
            name: "blinding-radiance-bloodied-save",
            flavorBody: "When you become bloodied you need to roll a constitution saving throw. If you fail this save, your celestial form is revealed."
        })
    ]
}
