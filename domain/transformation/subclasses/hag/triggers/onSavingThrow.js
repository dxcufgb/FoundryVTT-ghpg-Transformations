const HIDEOUS_APPEARANCE_UUID = "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU"
const ARCH_CRONES_HUNGER_UUID = "Compendium.transformations.gh-transformations.Item.6xN7rWi01hoqVLtv"

export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "apply exhaustion on failed save for hideous appearance",
            when: {
                saveFailed: "current",
                custom: {
                    saves: {
                        current: {
                            item: {
                                uuid: HIDEOUS_APPEARANCE_UUID
                            },
                            success: false
                        }
                    }
                }
            },
            actions: [
                {
                    type: "EXHAUSTION",
                    data: {
                        mode: "add",
                        amount: 1
                    }
                }
            ]
        },
        {
            name: "apply exhaustion on failed save for Arch-Crone's Hunger",
            when: {
                saveFailed: "current",
                custom: {
                    saves: {
                        current: {
                            item: {
                                uuid: ARCH_CRONES_HUNGER_UUID
                            },
                            success: false
                        }
                    }
                }
            },
            actions: [
                {
                    type: "EXHAUSTION",
                    data: {
                        mode: "add",
                        amount: 1
                    }
                }
            ]
        }
    ]
}
