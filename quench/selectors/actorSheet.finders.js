
import { waitForElement, waitForElements } from "../helpers/dom.js"
import { waitFor } from "../helpers/waitFor.js"
import { ActorSheetSelectors } from "./actorSheet.selectors.js"

/* ---------- Controls menu (state-based) ---------- */
export async function findActorSheetControlsMenu(sheet, options = {})
{
    return waitFor({
        ...options,
        predicate: () =>
            sheet?.window?.controlsDropdown ?? false,
        errorMessage: "Actor sheet controls menu did not open"
    })
}

export async function findActorSheetControlsButton(sheet, options = {})
{
    return waitForElement({
        root: sheet.element,
        selector: '[data-tooltip="Toggle Controls"]',
        ...options
    })
}

export async function findActorSheetControlsTranformationsItem(options = {})
{
    const control = [...document.querySelectorAll("li.context-item > span")].find(el => el.textContent.trim() === "Change Transformation")?.closest("li")
    return control
}

export function queryActorSheetControlsMenu(sheet)
{
    return sheet?.window?.controlsDropdown ?? null
}

/* ---------- GM admin item ---------- */

export async function findTransformationGMAdministrationItem(
    sheet,
    options = {}
)
{
    const menu = await findActorSheetControlsMenu(sheet, options)
    const item = menu.querySelector(
        ActorSheetSelectors.transformationGMAdminItem
    )

    return item
}

export function queryTransformationGMAdministrationItem(sheet)
{
    const menu = sheet?.window?.controlsDropdown
    const item = menu?.querySelector(
        ActorSheetSelectors.transformationGMAdminItem
    ) ?? null
    return item
}

/* ---------- Simple DOM pill ---------- */

export function findTransformationPill(sheet, options = {})
{
    return waitForElement({
        root: sheet.element,
        selector: ActorSheetSelectors.transformationPill,
        ...options
    })
}

export function findAllTransformationPills(sheet, options = {})
{
    return waitForElements({
        root: sheet.element,
        selector: ActorSheetSelectors.transformationPill,
        ...options
    })
}

export function findTransformationCardInSpecialTraitsTab(sheet, options = {})
{
    return waitForElement({
        root: sheet.element,
        selector: ActorSheetSelectors.transformationCard,
        ...options
    })
}

export function findEditModeSlider(sheet, options = {})
{
    return waitForElement({
        root: sheet.element,
        selector: ActorSheetSelectors.editModeButton,
        ...options
    })
}

export function findSpecialTraitsLink(sheet, options = {})
{
    return waitForElement({
        root: sheet.element,
        selector: ActorSheetSelectors.specialTraitsTabLink,
        ...options
    })
}