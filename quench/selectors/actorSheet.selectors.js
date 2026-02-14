import { generalSelector } from "./general.selectors.js"

export const ActorSheetSelectors = {
    ...generalSelector,
    transformationPill: ".transformation",
    transformationGMAdminItem: '[data-action="transformation-GM-config"]',
    controlsMenu: '[data-tooltip="Toggle Controls"]',
    transformationCard: '.tab-body > .tab[data-tab="specialTraits"] > .transformation-card',
    editModeButton: '.mode-slider',
    specialTraitsTabLink: 'a[data-tab="specialTraits"]'
}
