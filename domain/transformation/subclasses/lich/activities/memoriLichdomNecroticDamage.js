import { getHighestAvailableHitDieDenomination } from "../../fiend/giftsOfDamnation/getHighestAvailableHitDieDenomination.js"
import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveHtmlRoot,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"
import { isSoulVesselCharged } from "../soulVessel.js"

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

        if (!isSoulVesselCharged(actor)) {
            globalThis.ui?.notifications?.warn?.(
                "Memori Lichdom only works while your soul vessel is charged."
            )
            return
        }

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

        const target = this.resolveTarget(actor)
        if (!target) {
            globalThis.ui?.notifications?.warn?.(
                "Target the creature damaged by the triggering attack before rolling the Necrotic damage."
            )
            return
        }

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

        const applied = await this.applyDamage({
            actor,
            target,
            total: roll.total
        })

        await message.update({
            "flags.transformations.state": "rolled",
            "flags.transformations.presentedRoll": {
                total: roll.total
            },
            "flags.transformations.targetName": applied
                ? (target.name ?? target.actor?.name ?? null)
                : null
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

    static resolveTarget(actor)
    {
        const targets = Array.from(globalThis.game?.user?.targets ?? [])

        return targets.find(token => token?.actor && token.actor !== actor) ?? null
    }

    static async applyDamage({
        actor,
        target,
        total
    })
    {
        const amount = Number(total)
        if (!target?.actor || !Number.isFinite(amount) || amount <= 0) return false

        const applyTokenDamage = globalThis.MidiQOL?.applyTokenDamage
        if (typeof applyTokenDamage !== "function") return false

        const item =
                  actor?.items?.find?.(entry =>
                      entry?.flags?.transformations?.sourceUuid === this.itemSourceUuid
                  ) ??
                  actor?.items?.find?.(entry => entry?.name === CARD_TITLE) ??
                  null

        // midi-qol routes the damage through the GM when the target is not owned.
        await applyTokenDamage(
            [{value: amount, type: "necrotic"}],
            amount,
            new Set([target]),
            item,
            new Set(),
            {forceApply: false}
        )

        return true
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
                rollFormula,
                targetName: message?.flags?.transformations?.targetName ?? null
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
        rollFormula,
        targetName = null
    } = {})
    {
        if (state === "rolled" && roll) {
            const supplements = [
                `${DAMAGE_TYPE} damage rolled: <strong>${roll.total}</strong>.`
            ]
            if (targetName) {
                supplements.push(`Applied to ${foundry.utils.escapeHTML?.(targetName) ?? targetName}.`)
            }
            return supplements
        }

        return [
            `Spend one Hit Die and roll <strong>${rollFormula}</strong>.`
        ]
    }
}

const CARD_SELECTOR =
    "[data-transformations-card][data-lich-activity='memoriLichdomNecroticDamage']"
