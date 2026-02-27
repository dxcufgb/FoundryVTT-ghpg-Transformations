
export const onLongRest = {
    name: "longRest",
    actionGroups: [
        {
            name: "choose-damage-resistance",
            when: {
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.Isw6iMe5kwaeGwcf"
                    ]
                }
            },
            actions: [
                {
                    type: "DIALOG",
                    data: {
                        dialogFactoryFunction: "openTransformationGeneralChoiceDialog",
                        title: "Choose damage resistance",
                        choices: [
                            { icon: "modules/transformations/icons/damageTypes/Acid.png", id: "acid", label: "Acid" },
                            { icon: "modules/transformations/icons/damageTypes/Cold.png", id: "cold", label: "Cold" },
                            { icon: "modules/transformations/icons/damageTypes/Fire.png", id: "fire", label: "Fire" },
                            { icon: "modules/transformations/icons/damageTypes/Lightning.png", id: "lightning", label: "Lightning" },
                            { icon: "modules/transformations/icons/damageTypes/Psychic.png", id: "psychic", label: "Psychic" },
                            { icon: "modules/transformations/icons/damageTypes/Thunder.png", id: "thunder", label: "Thunder" }
                        ],
                        description: "As a Fey you gain resistance to one of the following damage types until the next long rest.",
                        key: "feyFormResistance"
                    }
                },
                {
                    type: "EFFECT",
                    data: {
                        mode: "create",
                        name: "Fey Form Resistance",
                        description: "Your Fey Form grants you resistance to @transformation.dialogChoices.feyFormResistance",
                        icon: "modules/transformations/icons/Transformations/Fey/Fey_Form.png",
                        changes: [
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "@transformation.dialogChoices.feyFormResistance"
                            }
                        ],
                        flags: {
                            transformations: {
                                removeOnLongRest: true
                            }
                        },
                        origin: "@actor.uuid",
                        source: "Fey Form"
                    }
                }
            ]
        }
    ]
}