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
        },
        {
            name: "weakend-constitution-saving-throw",
            when: {
                stage: { min: 3 },
            },
            actions: [
                {
                    type: "ITEM",
                    when: {
                        items: {
                            has: [
                                "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav"
                            ]
                        }
                    },
                    data: {
                        uuid: "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                },
                {
                    type: "SAVE",
                    data: {
                        ability: "con",
                        dc: "20",
                        key: "weakend-constitution-con-save"
                    }
                },
                {
                    type: "EXHAUSTION",
                    when: {
                        saveFailed: "weakend-constitution-con-save"
                    },
                    data: {
                        mode: "add",
                        value: 1
                    }
                },
                {
                    type: "CHAT",
                    data: {
                        message: "@actor.name gain one level of exhaustion due to their fey forms weakend constitution!"
                    }
                }
            ]
        }
    ]
}
