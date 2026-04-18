import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveHtmlRoot,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

const CARD_TITLE = "Grant Water Breathing"
const CARD_ICON = "icons/magic/water/bubbles-air-water-blue.webp"

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

        void ChatMessagePartInjector

        await injectSyntheticMidiActivityCard({
            message,
            content: await this.renderCard({
                actor,
                message,
                state: "initial"
            }),
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

        await actorRepository.consumeHitDie(actor, 1)

        await message.update({
            "flags.transformations.state": "rolled",
            "flags.transformations.presentedRoll": {
                total: roll.total
            }
        })

        void ChatMessagePartInjector

        await replaceSyntheticMidiActivityCard({
            message,
            content: await this.renderCard({
                actor,
                message,
                state: "rolled",
                roll
            }),
            selector: CARD_SELECTOR
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

    static async renderCard({
        actor,
        message,
        state,
        roll = null
    } = {})
    {
        const hitDie = message?.flags?.transformations?.hitDie ?? null
        const rollFormula =
                  message?.flags?.transformations?.rollFormula ??
                  (hitDie ? `1${hitDie}` : "1d6")
        const item = await resolveSyntheticCardItem({
            actor,
            message,
            fallbackName: CARD_TITLE,
            fallbackImg: CARD_ICON
        })

        return renderSyntheticMidiActivityCard({
            actor,
            item,
            title: CARD_TITLE,
            descriptionHtml: this.buildDescriptionHtml({rollFormula}),
            subtitle: this.buildSubtitle({
                state,
                rollFormula,
                roll
            }),
            supplements: this.buildSupplements({
                state,
                roll,
                rollFormula
            }),
            buttons: this.buildButtons({state}),
            roll,
            dataset: {
                hagActivity: this.id,
                state
            },
            cardClass: "hag-grant-water-breathing-card"
        })
    }

    static buildButtons({
        state
    } = {})
    {
        if (state !== "initial") return []

        return [
            buildSyntheticActivityButton({
                action: "rollDuration",
                label: "Roll Duration"
            })
        ]
    }

    static buildDescriptionHtml({
        rollFormula
    } = {})
    {
        return `<p>Roll ${rollFormula} to determine the duration in minutes.</p>`
    }

    static buildSubtitle({
        state,
        rollFormula,
        roll
    } = {})
    {
        if (state === "rolled" && roll) {
            return `Duration: ${roll.total} minute${roll.total === 1 ? "" : "s"}`
        }

        return `Duration Roll: ${rollFormula}`
    }

    static buildSupplements({
        state,
        roll,
        rollFormula
    } = {})
    {
        if (state === "rolled" && roll) {
            return [
                `Duration determined: <strong>${roll.total}</strong> minute${roll.total === 1 ? "" : "s"}.`
            ]
        }

        return [
            `Spend one Hit Die and roll <strong>${rollFormula}</strong>.`
        ]
    }
}

const CARD_SELECTOR =
    "[data-transformations-card][data-hag-activity='grantWaterBreathing']"
