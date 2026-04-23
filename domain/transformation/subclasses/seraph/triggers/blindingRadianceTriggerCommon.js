export const BLINDING_RADIANCE_UUID =
                 "Compendium.transformations.gh-transformations.Item.bZN7ITmrxwj3MmOI"

export const HIDING_CELESTIAL_FORM_EFFECT_NAME =
                 "Hiding Celestial Form"

export const BLINDING_RADIANCE_SAVE_DC_BY_STAGE = Object.freeze({
    2: 13,
    3: 16,
    4: 20
})

export const blindingRadianceSaveVariables = [
    {
        name: "transformationSaveDC",
        type: "stageDependent",
        value: BLINDING_RADIANCE_SAVE_DC_BY_STAGE
    }
]

export function createBlindingRadianceSaveActionGroup({
    name,
    when = {},
    flavorBody = "When your celestial form is stressed you need to roll a constitution saving throw. If you fail this save, your celestial form is revealed.",
    consumeUse = false
} = {})
{
    return {
        name,
        when: {
            stage: {min: 2},
            items: {
                has: [BLINDING_RADIANCE_UUID]
            },
            effects: {
                has: [HIDING_CELESTIAL_FORM_EFFECT_NAME]
            },
            ...when
        },
        actions: [
            consumeUse
                ? {
                    type: "ITEM",
                    data: {
                        uuid: BLINDING_RADIANCE_UUID,
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                }
                : null,
            {
                type: "SAVE",
                data: {
                    ability: "con",
                    dc: "@transformationSaveDC",
                    key: "blinding-radiance-con-save",
                    title: "Blinding Radiance",
                    flavor: {
                        itemUuid: BLINDING_RADIANCE_UUID,
                        subtitle: "Transformation Feature",
                        body: flavorBody
                    }
                }
            },
            {
                type: "EFFECT",
                when: {
                    saveFailed: "blinding-radiance-con-save"
                },
                data: {
                    mode: "remove",
                    name: HIDING_CELESTIAL_FORM_EFFECT_NAME
                }
            }
        ].filter(Boolean)
    }
}
