import {
    createAbilityScoreAdvancementState,
    getSpentAbilityScorePoints
} from "../../utils/abilityScoreAdvancement.js"

export function createAbilityScoreAdvancementViewModel({
    actor,
    advancementConfiguration = {},
    title = "Allocate Ability Scores",
    logger = null
})
{
    logger?.debug?.("createAbilityScoreAdvancementViewModel", {
        actor,
        advancementConfiguration,
        title
    })

    const state = createAbilityScoreAdvancementState({
        actor,
        advancementConfiguration
    })
    const pointsAvailable = state.advancementConfiguration.points
    const spentPoints = getSpentAbilityScorePoints(
        Object.fromEntries(
            state.abilities.map(ability => [ability.key, ability.selectedValue])
        ),
        state.abilities
    )

    return {
        title,
        confirmLabel: "Apply",
        cancelLabel: "Cancel",
        pointsAvailable,
        pointsRemaining: Math.max(pointsAvailable - spentPoints, 0),
        capLabel: Number.isFinite(state.advancementConfiguration.cap)
            ? String(state.advancementConfiguration.cap)
            : "No limit",
        maxLabel: Number.isFinite(state.advancementConfiguration.max)
            ? String(state.advancementConfiguration.max)
            : "No limit",
        abilities: state.abilities.map(ability => ({
            key: ability.key,
            label: ability.label,
            currentValue: ability.currentValue,
            fixedIncrease: ability.fixedIncrease,
            locked: ability.locked,
            maximumSelectableValue: ability.maximumSelectableValue,
            selectedValue: ability.selectedValue
        }))
    }
}
