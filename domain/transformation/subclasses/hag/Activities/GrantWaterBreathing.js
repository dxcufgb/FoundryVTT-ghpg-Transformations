const TEMPLATE_PATH =
    "modules/transformations/scripts/templates/chatMessages/hag-grant-water-breathing-chat-card.hbs"

export class GrantWaterBreathing
{
    static id = "grantWaterBreathing"

    static async activityUse({
        actor,
        message,
        actorRepository,
        ChatMessagePartInjector
    })
    {
        const hitDie = this.getHighestAvailableHitDie(actor, actorRepository)
        if (!hitDie) return

        await message.update({
            "flags.transformations.hagActivity": this.id,
            "flags.transformations.state": "initial",
            "flags.transformations.hitDie": hitDie,
            "flags.transformations.rollFormula": `1${hitDie}`,
            "flags.transformations.presentedRoll": null
        })

        await ChatMessagePartInjector.inject({
            message,
            template: TEMPLATE_PATH,
            templateData: {
                activityId: this.id,
                state: "initial",
                hitDie,
                roll: null,
                tooltip: null,
                rollFormula: `1${hitDie}`
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

        if (card.dataset.hagActivity !== this.id) return

        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async event =>
        {
            const button = event.target.closest("[data-transformations-action='rollDuration']")
            if (!button) return

            event.preventDefault()
            event.stopPropagation()

            logger?.debug?.("GrantWaterBreathing.bind.rollDuration", {
                actor,
                message
            })

            await this.rollDuration({
                actor,
                message,
                actorRepository,
                ChatMessagePartInjector,
                RollService
            })
        })
    }

    static async rollDuration({
        actor,
        message,
        actorRepository,
        ChatMessagePartInjector,
        RollService
    })
    {
        const hitDie = message.flags?.transformations?.hitDie
        if (!hitDie) return

        const availableHitDice = actorRepository?.getAvailableHitDice?.(actor) ?? 0
        if (availableHitDice <= 0) return

        const roll = await RollService.simpleRoll(hitDie)
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
                hitDie,
                roll: roll.total,
                tooltip,
                rollFormula: message.flags?.transformations?.rollFormula ?? `1${hitDie}`
            }
        })
    }

    static getHighestAvailableHitDie(actor, actorRepository)
    {
        const availableHitDie =
            actorRepository?.getHighestAvailableHitDice?.(actor)?.denomination
        if (availableHitDie) return availableHitDie

        const classHitDice = actor?.items
            ?.filter(item => item.type === "class" && Number(item.system?.hd?.value ?? 0) > 0)
            ?.map(item => item.system?.hd?.denomination)
            ?.filter(Boolean) ?? []

        const sortedHitDice = [...classHitDice].sort((left, right) =>
            Number.parseInt(String(right).replace("d", "")) -
            Number.parseInt(String(left).replace("d", ""))
        )

        return sortedHitDice[0] ?? null
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
    "[data-transformations-card][data-hag-activity='grantWaterBreathing']"
