const ABILITY_ICON_PATH = "modules/transformations/icons/abilities"

export const ABILITY_SCORE_ADVANCEMENT_ENTRIES = Object.freeze([
    Object.freeze({
        key: "str",
        label: "Strength",
        icon: `${ABILITY_ICON_PATH}/Strength.svg`
    }),
    Object.freeze({
        key: "dex",
        label: "Dexterity",
        icon: `${ABILITY_ICON_PATH}/Dexterity.svg`
    }),
    Object.freeze({
        key: "con",
        label: "Constitution",
        icon: `${ABILITY_ICON_PATH}/Constitution.svg`
    }),
    Object.freeze({
        key: "int",
        label: "Intelligence",
        icon: `${ABILITY_ICON_PATH}/Intelligence.svg`
    }),
    Object.freeze({
        key: "wis",
        label: "Wisdom",
        icon: `${ABILITY_ICON_PATH}/Wisdom.svg`
    }),
    Object.freeze({
        key: "cha",
        label: "Charisma",
        icon: `${ABILITY_ICON_PATH}/Charisma.svg`
    })
])

const ABILITY_SCORE_KEYS = new Set(
    ABILITY_SCORE_ADVANCEMENT_ENTRIES.map(entry => entry.key)
)

export function isAbilityScoreAdvancementConfiguration(
    advancementConfiguration = {}
)
{
    if (
        !advancementConfiguration ||
        typeof advancementConfiguration !== "object" ||
        Array.isArray(advancementConfiguration)
    ) {
        return false
    }

    return [
        "points",
        "fixed",
        "locked"
    ].some(key =>
        Object.prototype.hasOwnProperty.call(advancementConfiguration, key)
    )
}

export function normalizeAbilityScoreAdvancementConfiguration(
    advancementConfiguration = {}
)
{
    return Object.freeze({
        cap: normalizeLimit(advancementConfiguration.cap),
        fixed: normalizeAbilityScoreMap(advancementConfiguration.fixed),
        locked: normalizeLockedAbilities(advancementConfiguration.locked),
        max: normalizeLimit(advancementConfiguration.max),
        points: normalizeNonNegativeInteger(advancementConfiguration.points),
        recommendation:
            advancementConfiguration.recommendation ?? null
    })
}

export function createAbilityScoreAdvancementState({
    actor,
    advancementConfiguration = {}
} = {})
{
    const configuration = normalizeAbilityScoreAdvancementConfiguration(
        advancementConfiguration
    )

    return Object.freeze({
        advancementConfiguration: configuration,
        abilities: ABILITY_SCORE_ADVANCEMENT_ENTRIES.map(entry =>
            createAbilityState(entry, actor, configuration)
        )
    })
}

export function normalizeAbilityScoreSelection(
    selection = {},
    abilityStates = [],
    totalPoints = 0
)
{
    const requestedSelection =
        selection && typeof selection === "object"
            ? selection
            : {}
    const normalizedSelection = {}
    let remainingPoints = normalizeNonNegativeInteger(totalPoints)

    for (const abilityState of abilityStates) {
        normalizedSelection[abilityState.key] = abilityState.minimumValue
    }

    for (const abilityState of abilityStates) {
        const requestedValue = Number(requestedSelection?.[abilityState.key])
        if (!Number.isFinite(requestedValue) || abilityState.locked) continue

        const desiredValue = Math.max(
            abilityState.minimumValue,
            Math.min(
                Math.trunc(requestedValue),
                abilityState.maximumSelectableValue
            )
        )
        const desiredIncrease = Math.max(
            desiredValue - abilityState.minimumValue,
            0
        )
        const allowedIncrease = Math.min(desiredIncrease, remainingPoints)

        normalizedSelection[abilityState.key] =
            abilityState.minimumValue + allowedIncrease
        remainingPoints -= allowedIncrease
    }

    return normalizedSelection
}

export function getAbilityScoreSelectionChanges(
    selection = {},
    abilityStates = []
)
{
    return abilityStates.reduce((changes, abilityState) =>
    {
        const selectedValue = Number(selection?.[abilityState.key])
        const resolvedValue = Number.isFinite(selectedValue)
            ? selectedValue
            : abilityState.minimumValue

        if (resolvedValue <= abilityState.baseValue) {
            return changes
        }

        changes.push({
            ...abilityState,
            selectedValue: resolvedValue,
            increase: resolvedValue - abilityState.baseValue
        })

        return changes
    }, [])
}

export function getSpentAbilityScorePoints(
    selection = {},
    abilityStates = []
)
{
    return abilityStates.reduce((total, abilityState) =>
    {
        const selectedValue = Number(selection?.[abilityState.key])
        const resolvedValue = Number.isFinite(selectedValue)
            ? selectedValue
            : abilityState.minimumValue

        return total + Math.max(
            resolvedValue - abilityState.minimumValue,
            0
        )
    }, 0)
}

function createAbilityState(entry, actor, configuration)
{
    const baseValue = normalizeAbilityValue(
        actor?.system?.abilities?.[entry.key]?.value
    )
    const absoluteMax = Number.isFinite(configuration.max)
        ? Math.max(configuration.max, baseValue)
        : Number.POSITIVE_INFINITY
    const requestedFixedIncrease = configuration.fixed[entry.key] ?? 0
    const minimumValue = Math.min(
        baseValue + requestedFixedIncrease,
        absoluteMax
    )
    const fixedIncrease = minimumValue - baseValue
    const cappedValue = Number.isFinite(configuration.cap)
        ? baseValue + configuration.cap
        : Number.POSITIVE_INFINITY
    const maximumSelectableValue = Math.max(
        minimumValue,
        Math.min(absoluteMax, cappedValue)
    )

    return Object.freeze({
        ...entry,
        baseValue,
        currentValue: baseValue,
        fixedIncrease,
        locked: configuration.locked.includes(entry.key),
        minimumValue,
        maximumSelectableValue,
        selectedValue: minimumValue
    })
}

function normalizeAbilityScoreMap(fixed = {})
{
    if (!fixed || typeof fixed !== "object" || Array.isArray(fixed)) {
        return {}
    }

    return Object.entries(fixed).reduce((normalized, [key, value]) =>
    {
        if (!ABILITY_SCORE_KEYS.has(key)) {
            return normalized
        }

        normalized[key] = normalizeNonNegativeInteger(value)
        return normalized
    }, {})
}

function normalizeLockedAbilities(locked = [])
{
    if (!Array.isArray(locked)) {
        return []
    }

    return Array.from(new Set(
        locked.filter(key => ABILITY_SCORE_KEYS.has(key))
    ))
}

function normalizeAbilityValue(value)
{
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) {
        return 0
    }

    return Math.max(Math.trunc(numericValue), 0)
}

function normalizeNonNegativeInteger(value)
{
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) {
        return 0
    }

    return Math.max(Math.trunc(numericValue), 0)
}

function normalizeLimit(value)
{
    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) {
        return Number.POSITIVE_INFINITY
    }

    return Math.max(Math.trunc(numericValue), 0)
}
