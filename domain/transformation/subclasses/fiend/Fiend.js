import { Transformation } from "../../Transformation.js"
import { renderDevilishContractor } from "./activities/DevilishContractor.js"
import { giftsOfDamnation } from "./giftsOfDamnation/index.js";
import { ChatCardActionBinder } from "../../../../ui/chatCards/ChatCardActionBinder.js";

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class Fiend extends Transformation {
    static type = "fiend";
    static displayName = "Fiend"
    static itemId = "fiend";
    static uuid = "Compendium.transformations.gh-transformations.Item.zpVEJPFBfdqC5sQH";
    static giftsOfDamnations = giftsOfDamnation
    static fiendishSoulDamageTypes = ["acid", "cold", "fire"]

    static resolveGiftEntry(activity) {
        const giftId = activity?.flags?.transformations?.gift

        return this.giftsOfDamnations.find(gift =>
            gift.id === giftId ||
            gift.label === activity?.name
        ) ?? null
    }

    static onPreRollHitDie(context, actor)
    {
        const giftOfUnfetteredLoss = actor.items.find(i =>
            i.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.RyzgJyXTAcpO0hRn"
        )

        if (!giftOfUnfetteredLoss) return

        const currentHitDieMod =
                  actor.flags?.transformations?.fiend?.giftOfUnfetteredGlory?.hitDieModifier ?? 0
        const nextHitDieMod = currentHitDieMod + 2
        actor.flags.transformations.fiend.giftOfUnfetteredGlory.hitDieModifier = nextHitDieMod
        if (currentHitDieMod > 0) {
            for (const roll of context.rolls ?? []) {
                roll.parts = roll.parts.map(part =>
                {
                    if (typeof part !== "string") return part
                    return part + `-${currentHitDieMod}`
                })
            }
        }
    }

    static async getInfernalSmiteDamageType(workflow, rolls) {
        const item = workflow.item
        const actor = workflow.actor
        const activity = workflow.activity
        if (!actor) return

        if (!item || item.name !== "Infernal Smite") return

        const damageType = this.getFiendishSoulDamageType(actor)
        if (!damageType) return

        for (const roll of rolls) {
            roll.options.types.push(damageType)
        }

        for (const part of activity.damage.parts) {
            part.types.add(damageType)
        }
    }

    static getFiendishSoulDamageType(actor) {
        const fiendishSoul = actor?.items.find(i => i.name === "Fiendish Soul")
        if (!fiendishSoul) return null

        const resistanceEffect =
                  actor.effects.find(e =>
                      e.origin === fiendishSoul.uuid &&
                      e.flags?.transformations?.advancementChoiceType === "damageResistance"
                  ) ??
                  actor.effects.find(e =>
                      e.flags?.transformations?.advancementChoiceType === "damageResistance"
                  )

        const resistanceChange = resistanceEffect?.changes?.find(c =>
            c.key === "system.traits.dr.value"
        )

        return resistanceChange?.value ?? null
    }

    static async postCreateScript(actor, scriptName, context = {})
    {
        switch (scriptName) {
            case "configureAbyssalResistance":
                await this.configureAbyssalResistance(actor, context)
                break
        }
    }

    static async configureAbyssalResistance(actor, {
        createdItem
    } = {})
    {
        const immunityType = this.getFiendishSoulDamageType(actor)
        if (!immunityType) return

        const resistanceTypes = this.fiendishSoulDamageTypes.filter(type =>
            type !== immunityType
        )
        const abyssalResistanceItem =
                  createdItem?.name === "Abyssal Resistance"
                      ? createdItem
                      : actor?.items.find(item => item.name === "Abyssal Resistance")

        if (!abyssalResistanceItem) return

        const itemEffect =
                  abyssalResistanceItem.effects.find(effect => effect.name === "Abyssal Resistance") ??
                  actor?.effects.find(effect =>
                      effect.origin === abyssalResistanceItem.uuid &&
                      effect.name === "Abyssal Resistance"
                  )

        if (!itemEffect) return

        const description = String(itemEffect.description ?? "")
        .replaceAll("{immunityType}", immunityType)
        .replaceAll("{resistanceTypes}", resistanceTypes.join(", "))

        const updatedChanges = foundry.utils.deepClone(itemEffect.changes ?? [])
        let resistanceIndex = 0

        for (const change of updatedChanges) {
            if (change.key === "system.traits.di.value") {
                change.value = immunityType
                continue
            }

            if (change.key === "system.traits.dr.value" && change.value === "acid" && resistanceIndex < resistanceTypes.length) {
                change.value = resistanceTypes[resistanceIndex]
                resistanceIndex += 1

            }
        }

        await itemEffect.update({
            description,
            changes: updatedChanges
        })
    }

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
        const root = resolveHtmlRoot(html)
        if (!root) return

        const activityData = message?.flags?.dnd5e?.activity
        if (!activityData) return

        const activity = await fromUuid(activityData.uuid)
        if (!activity) return
        const giftEntry = this.resolveGiftEntry(activity)

        if (!actor.isOwner) return

        if (giftEntry) {

            ChatCardActionBinder.bind({
                message,
                html,
                giftsOfDamnation: this.giftsOfDamnations,
                actorRepository,
                dialogFactory,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        } else {

            const container = root.querySelector(".midi-buttons, .midi-dnd5e-buttons")
            if (!container) return

            switch (activity?.name) {
                case "Devilish Contractor":
                    await renderDevilishContractor({
                        actor,
                        dialogFactory,
                        container,
                        logger
                    })
                    break
            }
        }
    }

    static async onActivityUse(activity, usage, message, actorRepository, ChatMessagePartInjector) {
        const giftEntry = this.resolveGiftEntry(activity)
        if (!giftEntry) return

        const GiftClass = giftEntry.GiftClass

        if (!GiftClass?.giftActivity) return

        await GiftClass.giftActivity({
            actor: usage.workflow.actor,
            message,
            actorRepository,
            ChatMessagePartInjector
        })
    }

    static async onRoll(actor, roll) {
        if (roll?.hookName === "dnd5e.rollAttack") {
            const martialProwessGift = this.giftsOfDamnations.find(gift =>
                gift.id === "giftOfMartialProwess"
            )

            martialProwessGift?.GiftClass?.rememberAttackRoll(actor, roll)
        }

        const pullOfTheNetherworld = actor.items.find(i =>
            i.flags?.transformations?.sourceUuid === "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW"
        )

        if (!pullOfTheNetherworld) return

        const usesLeft = pullOfTheNetherworld.system.uses.max - pullOfTheNetherworld.system.uses.spent

        if (usesLeft == 0 || roll?.natural !== 1) return

        const activity = pullOfTheNetherworld.system.activities.find(a => a.name == "Midi Damage")
        activity.use()
    }
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}
