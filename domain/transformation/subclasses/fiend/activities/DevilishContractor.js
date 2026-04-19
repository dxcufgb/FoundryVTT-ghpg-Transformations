export async function renderDevilishContractor({
    actor,
    dialogFactory,
    container,
    logger
})
{
    const button = document.createElement("button")
    button.type = "button"
    button.textContent = "Choose gift of damnation"
    button.classList.add("fiend-devilish-contractor-button")

    button.addEventListener("click", async () =>
    {
        await handleDevilishContractorClick({
            actor,
            dialogFactory,
            logger
        })
    })

    container.prepend(button)
}

export async function handleDevilishContractorClick({
    actor,
    dialogFactory,
    logger
})
{
    logger?.debug?.("handleDevilishContractorClick", {actor})

    const stage = actor.getFlag("transformations", "stage") ?? 0
    let applied = false

    if (stage > 0) {
        await dialogFactory.openFiendGiftOfDamnation({
            actor,
            stage,
            triggeringUserId: game.user?.id ?? null
        })
    }
}
