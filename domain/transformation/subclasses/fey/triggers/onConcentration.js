export const onConcentration = {
    name: "concentration",

    actionGroups: [
        {
            name: "reset-weakend-constitution-save",
            when: {
                stage: { min: 3 }
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
        }
    ]
}