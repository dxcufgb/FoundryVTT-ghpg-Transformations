import {
    TRUE_APPEARANCE_EFFECT_NAME,
    TRUE_APPEARANCE_SAVE_ITEM_UUID
} from "./trueAppearanceTriggerCommon.js"

export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "remove true appearance hiding effect on failed midi save",
            when: {
                custom: {
                    saves: {
                        current: {
                            item: {
                                sourceUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID
                            },
                            success: false
                        }
                    }
                }
            },
            actions: [
                {
                    type: "EFFECT",
                    data: {
                        mode: "remove",
                        name: TRUE_APPEARANCE_EFFECT_NAME
                    }
                }
            ]
        }
    ]
}
