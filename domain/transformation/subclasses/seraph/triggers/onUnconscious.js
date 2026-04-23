import {
    createBlindingRadianceSaveActionGroup,
    blindingRadianceSaveVariables
} from "./blindingRadianceTriggerCommon.js"

export const onUnconscious = {
    name: "unconscious",
    variables: blindingRadianceSaveVariables,

    actionGroups: [
        createBlindingRadianceSaveActionGroup({
            name: "blinding-radiance-unconscious-save",
            flavorBody: "When you gain the unconscious condition you need to roll a constitution saving throw. If you fail this save, your celestial form is revealed."
        })
    ]
}
