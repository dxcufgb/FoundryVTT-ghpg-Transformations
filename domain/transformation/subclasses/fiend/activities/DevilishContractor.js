import { signNewContract } from "../giftsOfDamnation/giftContracts.js"

export async function renderDevilishContractor({
    actor,
    message = null,
    dialogFactory,
    container,
    logger
})
{
    logger?.debug?.("renderDevilishContractor", {actor, message})

    // Switching to a gift of an already signed contract (after a rest).
    const switchButton = document.createElement("button")
    switchButton.type = "button"
    switchButton.textContent = "Switch to a signed gift of damnation"
    switchButton.classList.add("fiend-devilish-contractor-switch-button")

    switchButton.addEventListener("click", async () =>
    {
        await handleDevilishContractorClick({
            actor,
            dialogFactory,
            logger,
            signContract: false
        })
    })

    // Using Devilish Contractor signs a new contract.
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Choose gift of damnation"
    button.classList.add("fiend-devilish-contractor-button")

    button.addEventListener("click", async () =>
    {
        await handleDevilishContractorClick({
            actor,
            dialogFactory,
            logger,
            messageId: message?.id ?? null
        })
    })

    container.prepend(switchButton)
    container.prepend(button)
}

export async function handleDevilishContractorClick({
    actor,
    dialogFactory,
    logger,
    messageId = null,
    signContract = true
})
{
    logger?.debug?.("handleDevilishContractorClick", {actor, messageId, signContract})

    const stage = actor.getFlag("transformations", "stage") ?? 0

    if (stage > 0) {
        if (signContract) {
            await signNewContract(actor, {messageId})
        }

        await dialogFactory.openFiendGiftOfDamnation({
            actor,
            stage,
            triggeringUserId: game.user?.id ?? null
        })
    }
}
