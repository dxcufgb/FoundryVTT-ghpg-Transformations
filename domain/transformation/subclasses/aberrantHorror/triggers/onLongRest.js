
export const onLongRest = {
    name: "longRest",
    actions: [
        {
            type: "MACRO",
            data: {
                trigger: "transformations.onLongRest",
                transformationType: "General",
                action: "removeOnLongRest",
                args: {}
            }
        },
        {
            type: "MACRO",
            data: {
                trigger: "transformations.onLongRest",
                transformationType: "aberrantHorror",
                action: "removeAberrantMutationEffects",
                args: {}
            }
        },
        {
            type: "APPLY_ROLLTABLE",
            when: {
                stage: [1],
            },
            data: {
                uuid: "Compendium.transformations.gh-roll-tables.RollTable.NcOgsdD3d4dassuY",
                displayChat: true,
                storeResultFlag: "unstableForm"
            }
        },
        {
            type: "APPLY_ROLLTABLE",
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
            type: "APPLY_ROLLTABLE",
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
            type: "APPLY_ROLLTABLE",
            when: {
                stage: [4],
            },
            data: {
                uuid: "Compendium.transformations.gh-roll-tables.RollTable.bHA1uo22DkMiJJuG",
                displayChat: true,
                storeResultFlag: "unstableForm"
            }
        },
        // {
        //     type: "APPLY_EFFECT",
        //     when: {
        //         actor: {
        //             hasItem: "Compendium.transformations.gh-transformations.Item.LYRqg32rV17vq7L2"
        //         }
        //     },
        //     data: {
        //         mode: "fromEffectCatalogByFlag",
        //         flag: "unstableForm"
        //     }
        // }
    ]
};