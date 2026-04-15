export const ROILING_ELEMENTS_UUID =
                 "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2"

export const ELEMENTAL_FORM_REVEALED_EFFECT_NAME =
                 "Elemental Form Revealed"

export const ELEMENTAL_FORM_REVEALED_EFFECT_UUID =
                 "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2.ActiveEffect.6EAcgYjOOVcirkBS"

export const ROILING_ELEMENTS_SAVE_DC_BY_STAGE = Object.freeze({
    2: 13,
    3: 16,
    4: 20
})

export const roilingElementsSaveVariables = [
    {
        name: "transformationSaveDC",
        type: "stageDependent",
        value: ROILING_ELEMENTS_SAVE_DC_BY_STAGE
    }
]

export function createRoilingElementsSaveActionGroup({
    name,
    when = {},
    flavorBody = "When your primordial nature is stressed you need to roll a constitution saving throw. If you fail this save, your elemental form is revealed."
} = {})
{
    return {
        name,
        when: {
            stage: {min: 2},
            items: {
                has: [ROILING_ELEMENTS_UUID]
            },
            effects: {
                missing: [ELEMENTAL_FORM_REVEALED_EFFECT_NAME]
            },
            ...when
        },
        actions: [
            {
                type: "SAVE",
                data: {
                    ability: "con",
                    dc: "@transformationSaveDC",
                    key: "roiling-elements-con-save",
                    title: "Roiling Elements",
                    flavor: {
                        img: "modules/transformations/Icons/Transformations/Primordial/Roiling%20Elements.png",
                        title: "Roiling Elements Saving Throw",
                        subtitle: "",
                        body: flavorBody
                    }
                }
            },
            {
                type: "EFFECT",
                when: {
                    saveFailed: "roiling-elements-con-save"
                },
                data: {
                    mode: "instantiate",
                    uuid: ELEMENTAL_FORM_REVEALED_EFFECT_UUID
                }
            }
        ]
    }
}
