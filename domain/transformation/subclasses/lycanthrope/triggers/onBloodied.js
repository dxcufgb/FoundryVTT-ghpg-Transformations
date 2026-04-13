import { LYCANTHROPE_BLOODIED_TRIGGER_ITEM_UUID, LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME } from "../constants.js"
import { lycanthropeMacros } from "../macros.js"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        {
            name: "lycanthrope-bloodied-hybrid-form",
            when: {
                stage: {min: 1},
                items: {
                    has: [
                        LYCANTHROPE_BLOODIED_TRIGGER_ITEM_UUID
                    ],
                    usesRemaining: {
                        min: 1
                    }
                },
                effects: {
                    missing: [
                        LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME
                    ]
                }
            },
            actions: [
                {
                    type: "ITEM",
                    data: {
                        uuid: LYCANTHROPE_BLOODIED_TRIGGER_ITEM_UUID,
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                },
                {
                    type: "SAVE",
                    data: {
                        ability: "wis",
                        dc: 10,
                        blocker: true,
                        key: "lycanthrope-bloodied-wis-save",
                        title: "Lycanthrope Bloodied",
                        flavor: {
                            itemUuid: LYCANTHROPE_BLOODIED_TRIGGER_ITEM_UUID,
                            subtitle: "Transformation Feature",
                            body: "The first time you become Bloodied after finishing a Short Rest or Long Rest, you must succeed on a DC 10 Wisdom saving throw. If you are in the light of a full moon, you automatically fail this saving throw."
                        }
                    }
                },
                {
                    type: "MACRO",
                    data: {
                        transformationType: "lycanthrope",
                        action: lycanthropeMacros.triggerBloodiedHybridTransform,
                        blocker: true,
                        args: {}
                    }
                }
            ]
        }
    ]
}
