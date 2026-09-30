const FEY_FORM_RESISTANCE_CHOICES = [
    { icon: "modules/transformations/Icons/DamageTypes/Acid.png", id: "acid", label: "Acid" },
    { icon: "modules/transformations/Icons/DamageTypes/Cold.png", id: "cold", label: "Cold" },
    { icon: "modules/transformations/Icons/DamageTypes/Fire.png", id: "fire", label: "Fire" },
    { icon: "modules/transformations/Icons/DamageTypes/Lightning.png", id: "lightning", label: "Lightning" },
    { icon: "modules/transformations/Icons/DamageTypes/Psychic.png", id: "psychic", label: "Psychic" },
    { icon: "modules/transformations/Icons/DamageTypes/Thunder.png", id: "thunder", label: "Thunder" }
]

// Seasonally Affected: the court's vulnerability cannot benefit from
// Resistance. The Summer (cold) and Winter (fire) flaw items carry an effect
// that sets flags.transformations.feyFormResistanceBlocked.<type>, and the
// matching type is left out of the Fey Form choice.
const FEY_FORM_RESISTANCE_BLOCKED_FLAG = "feyFormResistanceBlocked"

function feyFormResistanceDialog(when, excludedType = null)
{
    return {
        type: "DIALOG",
        when,
        data: {
            dialogFactoryFunction: "openTransformationGeneralChoiceDialog",
            title: "Choose damage resistance",
            choices: FEY_FORM_RESISTANCE_CHOICES.filter(choice => choice.id !== excludedType),
            description: "As a Fey you gain resistance to one of the following damage types until the next long rest.",
            key: "feyFormResistance"
        }
    }
}

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
                feyFormResistanceDialog({
                    actor: { notHasFlag: FEY_FORM_RESISTANCE_BLOCKED_FLAG }
                }),
                feyFormResistanceDialog({
                    actor: { hasFlag: `${FEY_FORM_RESISTANCE_BLOCKED_FLAG}.cold` }
                }, "cold"),
                feyFormResistanceDialog({
                    actor: { hasFlag: `${FEY_FORM_RESISTANCE_BLOCKED_FLAG}.fire` }
                }, "fire"),
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
