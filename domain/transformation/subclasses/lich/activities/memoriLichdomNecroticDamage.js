import { getHighestAvailableHitDieDenomination } from "../../fiend/giftsOfDamnation/getHighestAvailableHitDieDenomination.js"

const TEMPLATE_PATH =
    "modules/transformations/scripts/templates/chatMessages/lich-memori-lichdom-necrotic-damage-chat-card.hbs"

export class MemoriLichdomNecroticDamage
{
    static id = "memoriLichdomNecroticDamage"
    static itemSourceUuid = "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"

    static async activityUse({
        actor,
        message,
        actorRepository,
        ChatMessagePartInjector
    })
    {
        if (!actor || !message || !actorRepository || !ChatMessagePartInjector) return

        const hitDie = getHighestAvailableHitDieDenomination(actor, actorRepository)
        if (!hitDie) return

        const availableHitDice = actorRepository?.getAvailableHitDice?.(actor) ?? 0
        if (availableHitDice <= 0) return

        const rollFormula = `1${hitDie}[necrotic]`

        await message.update({
            "flags.transformations.lichActivity": this.id,
            "flags.transformations.state": "initial",
            "flags.transformations.hitDie": hitDie,
            "flags.transformations.rollFormula": rollFormula,
            "flags.transformations.damageType": "Necrotic",
            "flags.transformations.presentedRoll": null
        })

        await ChatMessagePartInjector.inject({
            message,
            template: TEMPLATE_PATH,
            templateData: {
                activityId: this.id,
                state: "initial",
                damageType: "Necrotic",
                hitDie,
                roll: null,
                rollFormula,
                tooltip: null
            },
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
        })
    }

    static bind({
        actor,
        message,
        html,
        actorRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        const root = resolveHtmlRoot(html)
        if (!root) return

        const card = root.matches?.(CARD_SELECTOR)
            ? root
            : root.querySelector?.(CARD_SELECTOR)
        if (!card) return

        if (card.dataset.lichActivity !== this.id) return

        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async event =>
        {
            const button = event.target.closest("[data-transformations-action='rollDamage']")
            if (!button) return

            event.preventDefault()
            event.stopPropagation()

            logger?.debug?.("MemoriLichdomNecroticDamage.bind.rollDamage", {
                actor,
                message
            })

            await this.rollDamage({
                actor,
                message,
                actorRepository,
                ChatMessagePartInjector,
                RollService
            })
        })
    }

    static async rollDamage({
        actor,
        message,
        actorRepository,
        ChatMessagePartInjector,
        RollService
    })
    {
        if (!actor || !message || !actorRepository || !ChatMessagePartInjector || !RollService) return

        const hitDie = message.flags?.transformations?.hitDie
        if (!hitDie) return

        const availableHitDice = actorRepository?.getAvailableHitDice?.(actor) ?? 0
        if (availableHitDice <= 0) return

        const rollFormula =
            message.flags?.transformations?.rollFormula ??
            `1${hitDie}[necrotic]`
        const roll = await RollService.simpleRoll(rollFormula)
        roll.options ??= {}
        roll.options.type = "damage"
        roll.options.flavor = "Necrotic"
        roll.options.types ??= []
        if (!roll.options.types.includes("necrotic")) {
            roll.options.types.push("necrotic")
        }
        const tooltip = await roll.getTooltip()
        const messageRolls = [...(message.rolls ?? []), roll]

        await actorRepository.consumeHitDie(actor, 1)

        await message.update({
            rolls: messageRolls,
            "flags.transformations.state": "rolled",
            "flags.transformations.presentedRoll": {
                total: roll.total,
                tooltip
            }
        })

        await ChatMessagePartInjector.replaceCard({
            message,
            template: TEMPLATE_PATH,
            templateData: {
                activityId: this.id,
                state: "rolled",
                damageType: "Necrotic",
                hitDie,
                roll: roll.total,
                rollFormula,
                tooltip
            }
        })
    }
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}

const CARD_SELECTOR =
    "[data-transformations-card][data-lich-activity='memoriLichdomNecroticDamage']"
