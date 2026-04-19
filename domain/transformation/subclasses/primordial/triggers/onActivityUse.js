import {
    createRoilingElementsSaveActionGroup,
    roilingElementsSaveVariables
} from "./roilingElementsTriggerCommon.js"

export const onActivityUse = {
    name: "activityUse",
    variables: roilingElementsSaveVariables,

    actionGroups: [
        createRoilingElementsSaveActionGroup({
            name: "roiling-elements-activity-use-save",
            when: {
                custom: {
                    activities: {
                        current: {
                            item: {
                                systemType: "transformation",
                                systemSubType: "primordial"
                            }
                        }
                    }
                }
            },
            flavorBody: "When you use a primordial transformation activity you need to roll a constitution saving throw. If you fail this save, your elemental form is revealed."
        })
    ]
}
