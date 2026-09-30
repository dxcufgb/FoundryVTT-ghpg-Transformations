import {
    createShadowsteelGhoulTriggerActionGroup,
    SHADOWSTEEL_GHOUL_EXPLOSION_ONCE_KEY
} from "./shadowsteelGhoulTriggerCommon.js"

export const onZeroHp = {
    name: "zeroHp",
    actionGroups: [
        createShadowsteelGhoulTriggerActionGroup({
            name: "shadowsteel-ghoul-zero-hp-midi-save",
            onceKey: SHADOWSTEEL_GHOUL_EXPLOSION_ONCE_KEY
        })
    ]
}
