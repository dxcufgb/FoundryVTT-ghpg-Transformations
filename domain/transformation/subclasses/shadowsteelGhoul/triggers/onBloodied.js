import {
    createShadowsteelGhoulTriggerActionGroup,
    SHADOWSTEEL_GHOUL_EXPLOSION_ONCE_KEY
} from "./shadowsteelGhoulTriggerCommon.js"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        createShadowsteelGhoulTriggerActionGroup({
            name: "shadowsteel-ghoul-bloodied-midi-save",
            onceKey: SHADOWSTEEL_GHOUL_EXPLOSION_ONCE_KEY
        })
    ]
}
