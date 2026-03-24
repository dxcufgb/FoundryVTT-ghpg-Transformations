import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfProdigiousTalent
{
    static id = "giftOfProdigiousTalent"
    static label = "Gift of Prodigious Talent"
    static itemUuid = "Compendium.transformations.gh-transformations.Item.LgnU3mYSWiHXTLJO"
    static stage = 1
    static description = "Choose two Skills. Gain Expertise in the chosen skills. \n\n If you roll a 1 or 2 on an Ability Check using one of the chosen skills, you immediately lose half your maximum number of Hit Point Dice, rounded down.You do not regain Hit Point Dice lost this way until you finish two Long Rests."

    static async apply({actor, actorRepository, itemRepository, advancementChoiceHandler}) {
        const sourceItem = this.itemUuid
            ? await fromUuid(this.itemUuid)
            : null
        if (!sourceItem) return null

        const choices = await advancementChoiceHandler?.choose({
            actor,
            advancementChoices: ['skills:*'],
            numberOfChoices: 2,
            sourceItem,
            apply: false
        })
        if (!Array.isArray(choices) || choices.length !== 2) {
            return null
        }

        const [firstChoice, secondChoice] = choices
        const description =
            `If you roll a 1 or 2 on an Ability Check using ` +
            `${firstChoice.label} or ${secondChoice.label}, you immediately lose ` +
            `half your maximum number of Hit Point Dice, rounded down. ` +
            `You do not regain Hit Point Dice lost this way until you finish two Long Rests.`

        return applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            actorRepository,
            sourceItem,
            itemOptions: {
                applyAdvancements: false,
                "system.advancement": [],
                "system.description.value": description
            },
            changes: choices.flatMap(choice => choice.changes ?? []),
            description,
            flagData: {
                skills: [
                    firstChoice.skillIdentifier,
                    secondChoice.skillIdentifier
                ],
                longRestsLeftUntilFullHitDieRestoration: 0
            }
        })
    }
}
