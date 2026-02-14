import { findActorSheetControlsButton } from "../selectors/actorSheet.finders.js"

export async function renderActorSheet(actor)
{
    const sheet = actor.sheet
    await sheet.render(true)
    return sheet
}

export async function openActorControlsMenu(actor)
{
    const sheet = await renderActorSheet(actor)
    const button = await findActorSheetControlsButton(sheet)
    button.dispatchEvent(
        new MouseEvent("click", { bubbles: true })
    )
    return sheet
}