
export const onLongRest = {
    name: "longRest",
    actions: [
        {
            type: "macro",
            data: {
                trigger: "transformations.onLongRest",
                transformationType: "aberrantHorror",
                action: "removeAberrantMutationEffects",
                trigger: "transformations.onLongRest"
            }
        },
        {
            type: "rollTable",
            when: {
                stage: [1],
            },
            data: {
                "uuid": "Compendium.transformations.gh-roll-tables.RollTable.NcOgsdD3d4dassuY",
                "displayChat": true,
                "storeResultFlag": "unstableForm"
            }
        },
        {
            type: "rollTable",
            when: {
                stage: [2],
            },
            data: {
                uuid: "Compendium.transformations.gh-roll-tables.RollTable.bHA1uo22DkMiJJuG",
                displayChat: true,
                storeResultFlag: "unstableForm"
            }
        },
        {
            type: "rollTable",
            when: {
                stage: [3],
            },
            data: {
                uuid: "Compendium.transformations.gh-roll-tables.RollTable.7M7eNAAjMGQhSiVY",
                displayChat: true,
                storeResultFlag: "unstableForm"
            }
        },
        {
            type: "rollTable",
            when: {
                stage: [4],
            },
            data: {
                uuid: "Compendium.transformations.gh-roll-tables.RollTable.bHA1uo22DkMiJJuG",
                displayChat: true,
                storeResultFlag: "unstableForm"
            }
        },
        {
            type: "effect",
            when: {
                actor: {
                    hasFlag: "unstableForm"
                }
            },
            data: {
                mode: "fromEffectCatalogByFlag",
                flag: "unstableForm"
            }
        }
    ]
};