export class GiftOfProdigiousTalent
{
    static id = "giftOfProdigiousTalent"
    static stage = 1
    static description = "Choose two Skills. Gain Expertise in the chosen skills. \n\n If you roll a 1 or 2 on an Ability Check using one of the chosen skills, you immediately lose half your maximum number of Hit Point Dice, rounded down.You do not regain Hit Point Dice lost this way until you finish two Long Rests."
    overridenDescription

    static async changes({actor, advancementChoiceHandler}) {
        const itemUuid = "Compendium.transformations.gh-transformations.Item.LgnU3mYSWiHXTLJO"
        const pack = game.packs.get("transformations.temp-items")
        await pack.getIndex()

        const sourceItem = await fromUuid(itemUuid)
        if (!sourceItem) return

        const choices = await advancementChoiceHandler.choose({
            actor,
            advancementChoices: ['skills:*'],
            numberOfChoices: 2,
            sourceItem,
            apply: false
        })

        const itemData = foundry.utils.deepClone(sourceItem.toObject())
        this.overridenDescription = `If you roll a 1 or 2 on an Ability Check using ${choices[0].label} or ${choices[1].label}, you immediately lose half your maximum number of Hit Point Dice, rounded down. You do not regain Hit Point Dice lost this way until you finish two Long Rests.`
        itemData.system.description.value = this.overridenDescription
        const flagPath = `flags.transformations.fiend.${this.id}`
        await actor.update({
            [flagPath]: {
                skills: [
                    choices[0].skillIdentifier,
                    choices[1].skillIdentifier
                ],
                longRestsLeftUntilFullHitDieRestoration: 0
            }
        })
        const tempItem = await await pack.documentClass.create(itemData, {
            pack: pack.collection
        })

        await tempItem.update({
            "flags.transformations.tempItem": true,
            "flags.transformations.createdBy": "giftOfDamnation"
        })

        const changes = []

        changes.push({
            key: "macro.createItem",
            mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
            value: tempItem.uuid
        })

        for (const choice of choices) {
            changes.push(choice.changes[0])
        }
        return changes
    }
}
