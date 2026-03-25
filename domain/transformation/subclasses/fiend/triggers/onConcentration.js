export const onConcentration = {
    name: "concentration",

    variables: [
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
            name: "fiend-form-save",
            when: {
                stage: { min: 2 }
            },
            actions: [
                {
                    type: "SAVE",
                    when: {
                        effects: { name: "Hiding Fiend Appearance" }
                    },
                    data: {
                        ability: "con",
                        dc: "@transformationSaveDC",
                        key: "fiend-form-con-save"
                    }
                },
                {
                    type: "EFFECT",
                    when: {
                        saveFailed: "fiend-form-con-save"
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
