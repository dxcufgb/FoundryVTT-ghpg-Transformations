// Slippery Ego (Ooze stage 4 flaw): the feral state is a temporary effect that
// ends on a DC 18 Wisdom save at the end of each of the actor's turns (midi-qol
// OverTime) or when the actor finishes a Short or Long Rest (DAE specialDuration).
export const SLIPPERY_EGO_EFFECT_NAME = "Slippery Ego: Lost Sense of Self"

const slipperyEgoNotActive = {
    effects: {
        missing: [SLIPPERY_EGO_EFFECT_NAME]
    }
}

export function createSlipperyEgoActions({ once } = {})
{
    const withOnce = key => (once ? { once: { key: `${once.key}-${key}`, reset: once.reset } } : {})

    return [
        {
            type: "CHAT",
            when: slipperyEgoNotActive,
            ...withOnce("chat"),
            data: {
                message: "@actor.name loses their grip on their mind (Slippery Ego)! They can't cast spells, activate magic items, understand language or communicate, and must use the Attack action on their next turn against a random creature within reach (or move towards the nearest creature). DC 18 Wisdom save at the end of each of their turns to end it; it also ends on a Short or Long Rest."
            }
        },
        {
            type: "EFFECT",
            when: slipperyEgoNotActive,
            ...withOnce("effect"),
            data: {
                mode: "create",
                name: SLIPPERY_EGO_EFFECT_NAME,
                icon: "modules/transformations/Icons/Transformations/Ooze/Slippery%20Ego.png",
                description: "<p>You can't cast spells, activate magic items, understand language, or communicate in any intelligible way. On your next turn you take the Attack action to make melee attacks against a random creature within reach; if none is within reach, you move (Dashing if necessary) until adjacent to the nearest creature.</p><p>At the end of each of your turns you make a DC 18 Wisdom saving throw, ending the effect on a success. The effect ends when you finish a Short or Long Rest.</p>",
                changes: [
                    {
                        key: "flags.midi-qol.OverTime",
                        mode: 0,
                        value: "turn=end, saveAbility=wis, saveDC=18, label=Slippery Ego"
                    }
                ],
                flags: {
                    dae: {
                        specialDuration: ["shortRest", "longRest"]
                    }
                }
            }
        }
    ]
}
