import { renderMidiRequestButtons } from "../../../../../ui/chatCards/MidiRequestButtons.js"
import { resolveHtmlRoot } from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

export const SHADOWSTEEL_CURSE_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.bTbxbNpRk21fnpwa"
export const SHADOWSTEEL_CURSE_ACTIVITY_ID = "8ITYCEjOp9WfjcOE"
export const SHADOWSTEEL_CURSE_ACTIVITY_UUID =
          `${SHADOWSTEEL_CURSE_ITEM_UUID}.Activity.${SHADOWSTEEL_CURSE_ACTIVITY_ID}`
export const SHADOWSTEEL_CURSES_TABLE_UUID =
          "Compendium.transformations.gh-roll-tables.RollTable.JKEPtezxBfLWiTWj"

const MIDI_BUTTONS_SELECTOR = ".midi-buttons"
const BUTTON_MARKER = "data-transformations-shadowsteel-curse-roll"
const MODULE_FLAG_SCOPE = "transformations"
export const CURSE_ROLLED_FLAG = "shadowsteelCurseRolled"

// Messages whose curse has been drawn on this client, so a second click can't draw again before the flag syncs.
const rolledMessages = new WeakSet()

export class ShadowsteelCurseRoll
{
    static async onRenderChatMessage({
        message,
        html,
        actor,
        logger
    } = {})
    {
        if (!actor?.isOwner) return
        if (!this.isCurseActivityMessage(message)) return
        if (this.isCurseRolled(message)) return

        const container = resolveHtmlRoot(html)?.querySelector(MIDI_BUTTONS_SELECTOR)
        if (!container) return
        if (container.querySelector(`[${BUTTON_MARKER}]`)) return

        container.insertAdjacentHTML("afterbegin", renderMidiRequestButtons({
            buttons: [{
                icon: '<i class="fa-solid fa-dice-d20" inert></i>',
                label: "Roll Shadowsteel Curse"
            }],
            rootAttributes: {[BUTTON_MARKER]: ""}
        }))

        const button = container.querySelector(`[${BUTTON_MARKER}] button`)
        button?.addEventListener("click", async event =>
        {
            event.preventDefault()
            event.stopPropagation()

            if (button.disabled || this.isCurseRolled(message)) return

            button.disabled = true
            rolledMessages.add(message)
            let result = null
            try {
                result = await this.rollCurse({logger})
            } catch (error) {
                logger?.warn?.("Rolling the Shadowsteel Curse failed", error)
            }
            if (result === null) {
                rolledMessages.delete(message)
                button.disabled = false
                return
            }

            await this.markCurseRolled(message, {logger})
        })
    }

    static isCurseRolled(message)
    {
        if (!message || typeof message !== "object") return false
        if (rolledMessages.has(message)) return true

        return Boolean(message.flags?.[MODULE_FLAG_SCOPE]?.[CURSE_ROLLED_FLAG])
    }

    static async markCurseRolled(message, {logger} = {})
    {
        logger?.debug?.("ShadowsteelCurseRoll.markCurseRolled", {message})
        if (typeof message?.setFlag !== "function") return
        if (message.isOwner === false) return

        try {
            await message.setFlag(MODULE_FLAG_SCOPE, CURSE_ROLLED_FLAG, true)
        } catch (error) {
            logger?.warn?.("Could not mark the Shadowsteel Curse as rolled on the chat message", error)
        }
    }

    static isCurseActivityMessage(message)
    {
        const activityData = message?.flags?.dnd5e?.activity
        if (!activityData) return false

        if (activityData.id === SHADOWSTEEL_CURSE_ACTIVITY_ID) return true

        return String(activityData.uuid ?? "")
        .endsWith(`.Activity.${SHADOWSTEEL_CURSE_ACTIVITY_ID}`)
    }

    static async rollCurse({logger} = {})
    {
        const table = await fromUuid(SHADOWSTEEL_CURSES_TABLE_UUID)

        if (!table || table.documentName !== "RollTable") {
            logger?.warn?.("Shadowsteel Curses roll table not found", SHADOWSTEEL_CURSES_TABLE_UUID)
            ui.notifications?.warn("Shadowsteel Curses roll table could not be found.")
            return null
        }

        return table.draw()
    }
}
