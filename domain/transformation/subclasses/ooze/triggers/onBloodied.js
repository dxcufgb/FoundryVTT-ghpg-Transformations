import { createSlipperyEgoActions } from "./slipperyEgo.js"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        {
            name: "apply slippery ego effect the first time bloodied after a long rest at stage 4",
            when: {
                stage: [4]
            },
            actions: createSlipperyEgoActions({
                once: {
                    key: "ooze-slippery-ego-bloodied",
                    reset: "longRest"
                }
            })
        }
    ]
}
