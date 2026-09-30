export const onDamage = {
    name: "damage",

    actionGroups: [
        {
            // Unstable Form is only rolled after a long rest that follows an
            // adventuring day in which the character took damage.
            name: "record-damage-taken",
            when: {
                stage: {min: 1},
                actor: {notHasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "set",
                        key: "aberrantHorror.tookDamage",
                        value: true
                    }
                }
            ]
        }
    ]
}
