import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveHtmlRoot,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

const CARD_TITLE = "Lich Magica"
const CARD_ICON = "icons/magic/control/debuff-energy-hold-teal-blue.webp"

const CARD_SELECTOR =
          "[data-transformations-card][data-lich-activity='lichMagicaRegainSpellSlots']"

export class LichMagicaRegainSpellSlots
{
    static id = "lichMagicaRegainSpellSlots"
    static itemSourceUuid = "Compendium.transformations.gh-transformations.Item.0wnk2ZQGOrwMvxH3"

    static async activityUse({
        actor,
        message,
        ChatMessagePartInjector
    })
    {
        if (!actor || !message || !ChatMessagePartInjector) return

        const transformationStage = getTransformationStage(actor)

        await message.update({
            "flags.transformations.lichActivity": this.id,
            "flags.transformations.state": "initial",
            "flags.transformations.transformationStage": transformationStage,
            "flags.transformations.resultMessage": null
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
        dialogFactory,
        ChatMessagePartInjector,
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
            const button = event.target.closest("[data-transformations-action='recoverSpellSlot']")
            if (!button) return

            event.preventDefault()
            event.stopPropagation()

            button.disabled = true

            logger?.debug?.("LichMagicaRegainSpellSlots.bind.recoverSpellSlot", {
                actor,
                message
            })

            await this.recoverSpellSlot({
                actor,
                message,
                dialogFactory,
                ChatMessagePartInjector
            })
        })
    }

    static async recoverSpellSlot({
        actor,
        message,
        dialogFactory,
        ChatMessagePartInjector
    })
    {
        if (!actor || !message || !ChatMessagePartInjector) return

        const transformationStage = getTransformationStage(actor)
        const selectedSpellSlot =
                  await dialogFactory?.openTransformationsSpellSlotRecovery?.({
                      actor,
                      title: "Recover Spell Slot",
                      description: this.getDescription(transformationStage),
                      confirmLabel: "Restore",
                      emptyMessage:
                          "No eligible expended spell slots can be recovered at your current Lich Transformation Stage.",
                      selectionMode: "single",
                      maxRecoverableLevel: transformationStage,
                      maxRecoverableCost: Number.POSITIVE_INFINITY,
                      useEntryGroupLabel: true,
                      triggeringUserId: game.user?.id ?? null
                  })

        const restored = await restoreSpellSlot(actor, selectedSpellSlot)
        const resultMessage = restored
            ? `Recovered ${getSpellSlotLabel(selectedSpellSlot)}.`
            : "No spell slot was recovered."

        await this.complete({
            message,
            transformationStage,
            resultMessage,
            ChatMessagePartInjector
        })
    }

    static async complete({
        message,
        transformationStage,
        resultMessage,
        ChatMessagePartInjector
    })
    {
        await message.update({
            "flags.transformations.state": "complete",
            "flags.transformations.transformationStage": transformationStage,
            "flags.transformations.resultMessage": resultMessage
        })

        void ChatMessagePartInjector

        await replaceSyntheticMidiActivityCard({
            message,
            content: await this.renderCard({
                actor: message?.speaker?.actor
                    ? game.actors.get(message.speaker.actor)
                    : null,
                message,
                state: "complete"
            }),
            selector: CARD_SELECTOR
        })
    }

    static getDescription(transformationStage)
    {
        const stage = Number(transformationStage ?? 0)
        if (stage <= 0) {
            return "Recover one expended spell slot. Your current Transformation Stage determines the highest level that can be restored."
        }

        return `Recover one expended spell slot of level ${stage} or lower.`
    }

    static async renderCard({
        actor,
        message,
        state
    } = {})
    {
        const transformationStage =
                  message?.flags?.transformations?.transformationStage ??
                  getTransformationStage(actor)
        const resultMessage =
                  message?.flags?.transformations?.resultMessage ??
                  null
        const description = this.getDescription(transformationStage)
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
            descriptionHtml: this.buildDescriptionHtml({
                state,
                description,
                resultMessage
            }),
            subtitle: `Transformation Stage ${transformationStage}`,
            supplements: this.buildSupplements({
                state,
                resultMessage
            }),
            buttons: this.buildButtons({state}),
            dataset: {
                lichActivity: this.id,
                state
            },
            cardClass: "lich-lich-magica-regain-spell-slots-card",
            hideItemDetails: !description && !resultMessage
        })
    }

    static buildButtons({
        state
    } = {})
    {
        if (state !== "initial") return []

        return [
            buildSyntheticActivityButton({
                action: "recoverSpellSlot",
                label: "Recover Spell Slot"
            })
        ]
    }

    static buildDescriptionHtml({
        state,
        description,
        resultMessage
    } = {})
    {
        if (state === "complete" && resultMessage) {
            return `<p>${resultMessage}</p>`
        }

        return `<p>${description}</p>`
    }

    static buildSupplements({
        state,
        resultMessage
    } = {})
    {
        if (state === "complete" && resultMessage) {
            return [resultMessage]
        }

        return []
    }
}

function getTransformationStage(actor)
{
    const rawStage =
              actor?.flags?.transformations?.stage ??
              actor?.getFlag?.("transformations", "stage") ??
              0
    const numericStage = Number(rawStage ?? 0)

    return Number.isFinite(numericStage)
        ? Math.max(numericStage, 0)
        : 0
}

async function restoreSpellSlot(actor, selectedSpellSlot)
{
    const slotKey = selectedSpellSlot?.slotKey
    if (!actor || !slotKey) return false

    const slot = actor.system?.spells?.[slotKey]
    const currentValue = Math.max(Number(slot?.value ?? 0), 0)
    const maxValue = getSpellSlotCapacity(slot)

    if (maxValue <= currentValue) return false

    await actor.update({
        [`system.spells.${slotKey}.value`]: Math.min(currentValue + 1, maxValue)
    })

    return true
}

function getSpellSlotCapacity(slot)
{
    if (!slot) return 0

    const rawOverride = slot.override
    if (rawOverride !== null && rawOverride !== undefined && rawOverride !== "") {
        const overrideValue = Number(rawOverride)
        return Number.isFinite(overrideValue)
            ? Math.max(overrideValue, 0)
            : 0
    }

    const maxValue = Number(slot.max ?? 0)
    return Number.isFinite(maxValue) ? Math.max(maxValue, 0) : 0
}

function getSpellSlotLabel(selectedSpellSlot)
{
    const level = Number(selectedSpellSlot?.level ?? 0)
    const slotType = selectedSpellSlot?.slotType ?? "spell"

    if (slotType === "pact") {
        return `a level ${level} pact slot`
    }

    return `a level ${level} spell slot`
}
