import {
    createRoilingElementsSaveActionGroup,
    roilingElementsSaveVariables
} from "./roilingElementsTriggerCommon.js"

export const onConditionApplied = {
    name: "conditionApplied",
    variables: roilingElementsSaveVariables,

    actionGroups: [
        createRoilingElementsSaveActionGroup({
            name: "roiling-elements-condition-save",
            when: {
                custom: {
                    conditions: {
                        current: {
                            name: ["charmed", "frightened"]
                        }
                    }
                }
            },
            flavorBody: "When you gain the charmed or frightened condition you need to roll a constitution saving throw. If you fail this save, your elemental form is revealed."
        })
    ]
}
