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

export const HIDEOUS_APPEARANCE_TRIGGER_TEXT = {
    bloodied: "When you become Bloodied",
    concentration: "When you start concentrating on a spell",
    unconscious: "When you gain the Unconscious condition"
}

export function createHideousAppearanceSaveActionGroup(triggerText = HIDEOUS_APPEARANCE_TRIGGER_TEXT.bloodied)
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
                        body: `${triggerText} while hiding your true form, you need to roll a DC @transformationSaveDC Constitution saving throw. If you fail this save, your Hideous Appearance is revealed.`
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
