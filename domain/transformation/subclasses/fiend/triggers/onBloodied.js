export const onBloodied = {
    name: "bloodied",

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
                stage: {min: 2}
            },
            actions: [
                {
                    type: "SAVE",
                    when: {
                        effects: {name: "Hiding Fiend Appearance"}
                    },
                    data: {
                        ability: "con",
                        dc: "@transformationSaveDC",
                        key: "fiend-form-con-save",
                        title: "Fiend Appearance",
                        flavor: {
                            itemUuid: "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                            subtitle: "Transformation Feature",
                            body: "When you become bloodied you need to roll a DC @transformationSaveDC constitution saving throw. If you fail this save, your Horrific Appearance is revealed."
                        }
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
