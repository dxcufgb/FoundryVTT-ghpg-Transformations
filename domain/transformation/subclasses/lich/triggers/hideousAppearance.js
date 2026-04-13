export const HIDE_HIDEOUS_APPEARANCE_EFFECT_NAME = "Hiding Hideous Appearance"

export const hideousAppearanceSaveVariables = [
    {
        name: "transformationSaveDC",
        type: "stageDependent",
        value: {
            2: 13,
            3: 16,
            4: 20
        }
    }
]

export function createHideousAppearanceSaveActionGroup()
{
    return {
        name: "hideous-appearance-save",
        when: {
            stage: {min: 2}
        },
        actions: [
            {
                type: "SAVE",
                when: {
                    effects: {
                        has: [HIDE_HIDEOUS_APPEARANCE_EFFECT_NAME]
                    }
                },
                data: {
                    ability: "con",
                    dc: "@transformationSaveDC",
                    key: "hideous-appearance-con-save",
                    title: "Hideous Appearance",
                    flavor: {
                        img: "",
                        title: "",
                        subtitle: "",
                        body: "When you become bloodied you need to roll a constitution saving throw. If you fail this save, your Horrific Appearance is revealed."
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
                    name: HIDE_HIDEOUS_APPEARANCE_EFFECT_NAME
                }
            }
        ]
    }
}
