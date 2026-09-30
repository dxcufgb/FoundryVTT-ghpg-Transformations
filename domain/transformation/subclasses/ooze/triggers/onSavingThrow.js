import { createSlipperyEgoActions } from "./slipperyEgo.js"

export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "apply slippery ego effect on natural 1 save at stage 4",
            when: {
                stage: [4],
                custom: {
                    saves: {
                        current: {
                            naturalRoll: 1
                        }
                    }
                }
            },
            actions: createSlipperyEgoActions()
        }
    ]
}
