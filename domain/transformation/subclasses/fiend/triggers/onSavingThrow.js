export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "remove fiend form on spell save natural 1 or 2",
            when: {
                stage: [3],
                custom: {
                    saves: {
                        current: {
                            isSpell: true,
                            naturalRoll: [1, 2]
                        }
                    }
                }
            },
            actions: [
                {
                    type: "EFFECT",
                    when: {
                        effects: { name: "Hiding Fiend Appearance" }
                    },
                    data: {
                        mode: "remove",
                        name: "Hiding Fiend Appearance"
                    }
                }
            ]
        },
        {
            name: "remove fiend form on failed save",
            when: {
                stage: [4],
                saveFailed: "current"
            },
            actions: [
                {
                    type: "EFFECT",
                    when: {
                        effects: { name: "Hiding Fiend Appearance" }
                    },
                    data: {
                        mode: "remove",
                        name: "Hiding Fiend Appearance"
                    }
                }
            ]
        }
    ]
}
