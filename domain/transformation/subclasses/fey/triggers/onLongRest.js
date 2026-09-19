
export const onLongRest = {
    name: "longRest",
    actionGroups: [
        {
            name: "remove-fey-effects",
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
            ]
        },
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
                            { icon: "modules/transformations/Icons/DamageTypes/Acid.png", id: "acid", label: "Acid" },
                            { icon: "modules/transformations/Icons/DamageTypes/Cold.png", id: "cold", label: "Cold" },
                            { icon: "modules/transformations/Icons/DamageTypes/Fire.png", id: "fire", label: "Fire" },
                            { icon: "modules/transformations/Icons/DamageTypes/Lightning.png", id: "lightning", label: "Lightning" },
                            { icon: "modules/transformations/Icons/DamageTypes/Psychic.png", id: "psychic", label: "Psychic" },
                            { icon: "modules/transformations/Icons/DamageTypes/Thunder.png", id: "thunder", label: "Thunder" }
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
                        icon: "modules/transformations/Icons/Transformations/Fey/Fey_Form.png",
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