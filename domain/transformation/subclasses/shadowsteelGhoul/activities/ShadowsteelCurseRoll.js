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

            button.disabled = true
            try {
                await this.rollCurse({logger})
            } finally {
                button.disabled = false
            }
        })
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
