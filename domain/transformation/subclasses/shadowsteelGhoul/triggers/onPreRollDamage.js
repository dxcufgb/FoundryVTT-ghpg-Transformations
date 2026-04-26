export const onPreRollDamage = {
    name: "preRollDamage",
    actionGroups: [
        {
            name: "Shadowsteel Weapon Master damage",
            when: {
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.cPHwqVOf3unl7c1r"
                    ]
                },
                custom: {
                    damage: {
                        current: {
                            itemDocument: {
                                flags: {
                                    transformations: {
                                        shadowsteelGhoul: {
                                            shadowsteelWeapon: 1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            actions: [
                {
                    type: "ROLL_MODIFIER",
                    data: {
                        mode: "addFlatBonus",
                        key: "shadowsteelGhoul.shadowsteelWeaponMasterDamage",
                        value: 4
                    }
                }
            ]
        }
    ]
}
