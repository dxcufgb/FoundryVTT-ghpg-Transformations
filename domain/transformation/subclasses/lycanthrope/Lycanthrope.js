import { Transformation } from "../../Transformation.js"

function getMarkedTargets()
{
    return Array.from(globalThis.game?.user?.targets ?? []).filter(target =>
    {
        const actor = target?.actor ?? target?.document?.actor ?? null
        const huntersMark =
                  actor?.flags?.transformations?.lycanthrope?.huntersMark ??
                  actor?.getFlag?.("transformations", "lycanthrope.huntersMark") ??
                  0

        return Number(huntersMark) === 1
    })
}

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Lycanthrope extends Transformation
{
    static type = "lycanthrope"
    static displayName = "Lycanthrope"
    static itemId = "lycanthrope"
    static uuid = "Compendium.transformations.gh-transformations.Item.u7PEMryfWOkT6aja"

    static async onPreRollAttack({ rollConfig } = {})
    {
        if (!rollConfig) return
        if (!getMarkedTargets().length) return

        if (rollConfig.disadvantage === true) {
            rollConfig.disadvantage = false
        }

        rollConfig.advantage = true
    }
}
