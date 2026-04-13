export const onUnconscious = {
    name: "unconscious",
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
            name: "hideous-appearance-save",
            when: {
                stage: {min: 2}
            },
            actions: [
                {
                    type: "SAVE",
                    when: {
                        effects: {name: "Hiding Hideous Appearance"}
                    },
                    data: {
                        ability: "con",
                        dc: "@transformationSaveDC",
                        key: "hideous-appearance-con-save",
                        title: "Hideous Appearance",
                        flavor: {
                            itemUuid: "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                            subtitle: "Transformation Feature",
                            body: "When you become bloodied you need to roll a DC @transformationSaveDC constitution saving throw. If you fail this save, your Horrific Appearance is revealed."
                        }
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
