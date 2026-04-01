export const onBloodied = {
    name: "bloodied",

    variables: [
        {
            name: "regainedHitPoints",
            type: "formula",
            value: "@prof + @transformation.stage"
        },
        {
            name: "transformationSaveDC",
            type: "stageDependent",
            value: {
                2: 13,
                3: 16,
                4: 20
            }
        }
    ],

    actionGroups: [
        {
            name: "aberrant-form-temp-hp",
            when: {
                stage: { min: 1 }
            },
            actions: [
                {
                    type: "ITEM",
                    when: {
                        items: {
                            has: [
                                ""
                            ]
                        }
                    },
                    data: {
                        uuid: "",
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                },
                {
                    type: "HP",
                    data: {
                        mode: "temp",
                        value: "@regainedHitPoints"
                    }
                },
                {
                    type: "CHAT",
                    data: {
                        message: "Aberrant Form activates and gives @regainedHitPoints temporary hit points!"
                    }
                }
            ]
        },
        {
            name: "hideous-appearance-save",
            when: {
                stage: { min: 2 }
            },
            actions: [
                {
                    type: "SAVE",
                    when: {
                        effects: { name: "Hiding Hideous Appearance" }
                    },
                    data: {
                        ability: "con",
                        dc: "@transformationSaveDC",
                        key: "hideous-appearance-con-save"
                    }
                },
                {
                    type: "EFFECT",
                    when: {
                        saveFailed: "hideous-appearance-con-save"
                    },
                    data: {
                        mode: "remove",
                        name: "Hiding Hideous Appearance"
                    }
                }
            ]
        },
        {
            name: "bloodied-mutation-roll",
            when: {
                stage: { min: 4 },
            },
            actions: [
                {
                    type: "APPLY_ROLLTABLE",
                    once: {
                        key: "bloodied-roll",
                        reset: "longRest"
                    },
                    data: {
                        uuid: "",
                        mode: "downgradeOnly"
                    }
                }
            ]
        }
    ]
}
