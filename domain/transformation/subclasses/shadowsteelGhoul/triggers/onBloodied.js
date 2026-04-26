import {
    createShadowsteelGhoulTriggerActionGroup,
    SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY
} from "./shadowsteelGhoulTriggerCommon.js"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        createShadowsteelGhoulTriggerActionGroup({
            name: "shadowsteel-ghoul-bloodied-midi-save",
            onceKey: SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY
        })
    ]
}
