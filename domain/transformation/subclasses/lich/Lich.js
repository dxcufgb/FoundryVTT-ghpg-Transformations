import { Transformation } from "../../Transformation.js"
import { MemoriLichdomNecroticDamage } from "./activities/memoriLichdomNecroticDamage.js"
import { LichMagicaRegainSpellSlots } from "./activities/LichMagicaRegainSpellSlots.js"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Lich extends Transformation
{
    static type = "lich"
    static displayName = "Lich"
    static itemId = "lich"
    static uuid = "Compendium.transformations.gh-transformations.Item.qCXHhnuwhElccjKq"

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        dialogFactory,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        if (!actor?.isOwner) return

        switch (message?.flags?.transformations?.lichActivity) {
            case MemoriLichdomNecroticDamage.id:
                MemoriLichdomNecroticDamage.bind({
                    actor,
                    message,
                    html,
                    actorRepository,
                    ChatMessagePartInjector,
                    RollService,
                    logger
                })
                break
            case LichMagicaRegainSpellSlots.id:
                LichMagicaRegainSpellSlots.bind({
                    actor,
                    message,
                    html,
                    dialogFactory,
                    ChatMessagePartInjector,
                    logger
                })
                break
        }
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector
    )
    {
        const itemSourceUuid =
                  usage?.workflow?.item?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.parent?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.flags?.transformations?.sourceUuid ??
                  null
        const itemName =
                  activity?.parent?.parent?.name ??
                  activity?.parent?.name ??
                  usage?.workflow?.item?.name ??
                  ""
        const activityName = activity?.name?.toLowerCase?.() ?? ""

        switch (activityName) {
            case "necrotic damage":
                if (
                    itemSourceUuid !== MemoriLichdomNecroticDamage.itemSourceUuid &&
                    itemName !== "Memori Lichdom"
                ) {
                    return
                }

                await MemoriLichdomNecroticDamage.activityUse({
                    actor: usage?.workflow?.actor,
                    message,
                    actorRepository,
                    ChatMessagePartInjector
                })
                break
            case "regain spell slot":
                if (
                    itemSourceUuid !== LichMagicaRegainSpellSlots.itemSourceUuid &&
                    itemName !== "Lich Magica"
                ) {
                    return
                }

                await LichMagicaRegainSpellSlots.activityUse({
                    actor: usage?.workflow?.actor,
                    message,
                    ChatMessagePartInjector
                })
                break
        }
    }
}
