import { createTrueAppearanceSaveActionGroup } from "./trueAppearanceTriggerCommon.js"

export const onUnconscious = {
    name: "unconscious",
    actionGroups: [
        createTrueAppearanceSaveActionGroup({
            name: "true-appearance-unconscious-save"
        })
    ]
}
