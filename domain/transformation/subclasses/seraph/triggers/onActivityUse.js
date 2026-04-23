import {
    createBlindingRadianceSaveActionGroup,
    blindingRadianceSaveVariables
} from "./blindingRadianceTriggerCommon.js"

export const onActivityUse = {
    name: "activityUse",
    variables: blindingRadianceSaveVariables,

    actionGroups: [
        createBlindingRadianceSaveActionGroup({
            name: "blinding-radiance-activity-use-save",
            when: {
                custom: {
                    activities: {
                        current: {
                            item: {
                                systemType: "transformation",
                                systemSubType: "seraph"
                            }
                        }
                    }
                }
            },
            flavorBody: "When you use a seraph transformation activity you need to roll a constitution saving throw. If you fail this save, your celestial form is revealed.",
            consumeUse: true
        })
    ]
}
