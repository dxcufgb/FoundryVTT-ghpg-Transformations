/**
 * Devilish Contractor bookkeeping.
 *
 * - Every Gift of Damnation gained through a new contract is remembered as a
 *   signed contract (flags.transformations.fiendContracts.signed).
 * - Signing a new contract (using Devilish Contractor) lets the next gift be
 *   any gift of your Stage or lower, replacing an active one if needed.
 * - Finishing a Long Rest (or a Short Rest with Enhanced Contract) allows one
 *   switch to a gift of an already signed contract. Devilish Subcontractor
 *   still only switches one gift per rest.
 * - Filling an empty gift slot (e.g. the second Devilish Subcontractor slot)
 *   with a signed gift is not a switch.
 */
export const DEVILISH_CONTRACTOR_SOURCE_UUID =
    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
export const ENHANCED_CONTRACT_SOURCE_UUID =
    "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"

const FLAG_SCOPE = "transformations"
const CONTRACTS_FLAG_KEY = "fiendContracts"
const MAX_REMEMBERED_CONTRACT_MESSAGES = 50

export function getActiveGiftIds(actor)
{
    return [...(actor?.effects ?? [])]
        .filter(effect => effect?.flags?.transformations?.giftOfDamnation === true)
        .map(effect => effect.flags.transformations.giftOfDamnationId)
        .filter(Boolean)
}

export function hasEnhancedContract(actor)
{
    return [...(actor?.items ?? [])].some(item =>
        item?.flags?.transformations?.sourceUuid === ENHANCED_CONTRACT_SOURCE_UUID
    )
}

/**
 * Current contract state. Gifts that are active count as signed, so actors
 * that gained a gift before contracts were tracked keep it switchable.
 */
export function getContractState(actor)
{
    const stored = actor?.flags?.[FLAG_SCOPE]?.[CONTRACTS_FLAG_KEY] ?? {}
    const signed = Array.isArray(stored.signed) ? stored.signed : []

    return {
        signed: [...new Set([...signed, ...getActiveGiftIds(actor)])],
        pendingContract: stored.pendingContract === true,
        switchAvailable: stored.switchAvailable === true,
        contractMessageIds: Array.isArray(stored.contractMessageIds)
            ? stored.contractMessageIds
            : []
    }
}

async function saveContractState(actor, state)
{
    await actor.setFlag(FLAG_SCOPE, CONTRACTS_FLAG_KEY, {
        signed: state.signed,
        pendingContract: state.pendingContract,
        switchAvailable: state.switchAvailable,
        contractMessageIds: state.contractMessageIds
    })
}

/**
 * A new contract was signed (Devilish Contractor used). A chat card only
 * signs one contract, however often its button is clicked.
 */
export async function signNewContract(actor, {
    messageId = null
} = {})
{
    if (!actor) return false

    const state = getContractState(actor)
    if (messageId && state.contractMessageIds.includes(messageId)) {
        return state.pendingContract
    }

    state.pendingContract = true
    if (messageId) {
        state.contractMessageIds = [
            ...state.contractMessageIds,
            messageId
        ].slice(-MAX_REMEMBERED_CONTRACT_MESSAGES)
    }

    await saveContractState(actor, state)
    return true
}

/**
 * A rest allows switching one gift to another signed gift.
 */
export async function grantGiftSwitch(actor)
{
    if (!actor) return false

    const state = getContractState(actor)
    if (state.switchAvailable) return true

    state.switchAvailable = true
    await saveContractState(actor, state)
    return true
}

/**
 * Whether the actor may gain the gift now.
 * `replacing` is true when an active gift has to make room for it.
 */
export function evaluateGiftSwitch(actor, giftId, {
    replacing = false,
    label = giftId
} = {})
{
    if (!actor || !giftId) {
        return {allowed: false, consumes: null, reason: "No Gift of Damnation selected."}
    }

    const state = getContractState(actor)

    if (getActiveGiftIds(actor).includes(giftId)) {
        return {
            allowed: false,
            consumes: null,
            reason: `${label} is already an active Gift of Damnation.`
        }
    }

    if (state.pendingContract) {
        return {allowed: true, consumes: "contract", reason: null}
    }

    if (!state.signed.includes(giftId)) {
        return {
            allowed: false,
            consumes: null,
            reason: `You have no signed contract for ${label}. Sign a new contract with Devilish Contractor to gain it.`
        }
    }

    if (!replacing) {
        return {allowed: true, consumes: null, reason: null}
    }

    if (state.switchAvailable) {
        return {allowed: true, consumes: "rest", reason: null}
    }

    return {
        allowed: false,
        consumes: null,
        reason: hasEnhancedContract(actor)
            ? "You can only switch your Gift of Damnation when you finish a Short or Long Rest."
            : "You can only switch your Gift of Damnation when you finish a Long Rest."
    }
}

/**
 * Called once a gift was gained: remembers its contract and uses up the new
 * contract, or the rest's switch when an active gift was replaced.
 */
export async function recordGiftGained(actor, giftId, {
    replacedGift = false
} = {})
{
    if (!actor || !giftId) return

    const state = getContractState(actor)

    if (!state.signed.includes(giftId)) {
        state.signed = [...state.signed, giftId]
    }

    if (state.pendingContract) {
        state.pendingContract = false
    } else if (replacedGift) {
        state.switchAvailable = false
    }

    await saveContractState(actor, state)
}
