import { getHighestAvailableHitDieDenomination } from "../../fiend/giftsOfDamnation/getHighestAvailableHitDieDenomination.js"
import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveHtmlRoot,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

const CARD_TITLE = "Memori Lichdom"
const DAMAGE_TYPE = "Necrotic"
const CARD_ICON = "icons/magic/death/skull-horned-worn-fire-blue.webp"

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
            "flags.transformations.damageType": DAMAGE_TYPE,
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
                  (hitDie ? `1${hitDie}[necrotic]` : "1d6[necrotic]")
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
                lichActivity: this.id,
                state
            },
            cardClass: "lich-memori-lichdom-necrotic-damage-card"
        })
    }

    static buildButtons({
        state
    } = {})
    {
        if (state !== "initial") return []

        return [
            buildSyntheticActivityButton({
                action: "rollDamage",
                label: "Roll Damage"
            })
        ]
    }

    static buildDescriptionHtml({
        rollFormula
    } = {})
    {
        return `<p>Roll ${rollFormula} to deal ${DAMAGE_TYPE} damage.</p>`
    }

    static buildSubtitle({
        state,
        rollFormula,
        roll
    } = {})
    {
        if (state === "rolled" && roll) {
            return `${DAMAGE_TYPE}: ${roll.total}`
        }

        return `${DAMAGE_TYPE} Damage Roll: ${rollFormula}`
    }

    static buildSupplements({
        state,
        roll,
        rollFormula
    } = {})
    {
        if (state === "rolled" && roll) {
            return [
                `${DAMAGE_TYPE} damage rolled: <strong>${roll.total}</strong>.`
            ]
        }

        return [
            `Spend one Hit Die and roll <strong>${rollFormula}</strong>.`
        ]
    }
}

const CARD_SELECTOR =
    "[data-transformations-card][data-lich-activity='memoriLichdomNecroticDamage']"
