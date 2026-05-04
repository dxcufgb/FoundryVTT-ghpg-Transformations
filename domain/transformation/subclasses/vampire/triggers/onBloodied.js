import { createTrueAppearanceSaveActionGroup } from "./trueAppearanceTriggerCommon.js"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        createTrueAppearanceSaveActionGroup({
            name: "true-appearance-bloodied-save"
        })
    ]
}
