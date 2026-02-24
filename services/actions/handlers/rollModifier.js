export function createRollModifierAction({ tracker, logger })
{

    return async function ROLL_MODIFIER({
        actor,
        action,
        context
    })
    {

        return tracker.track((async () =>
        {

            const { type, string } = action.mode ?? {}

            if (!context?.rolls) return false

            if (type === "remove") {
                for (const roll of context.rolls ?? []) {
                    roll.parts = roll.parts.map(part =>
                    {
                        if (typeof part !== "string") return part
                        return part.replaceAll(string, "").trim()
                    })
                }
                return true
            }

            return false

        })())
    }
}
