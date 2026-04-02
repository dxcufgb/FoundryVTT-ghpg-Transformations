export function getHighestAvailableHitDieDenomination(actor, actorRepository)
{
    const availableHitDie =
              actorRepository?.getHighestAvailableHitDice?.(actor)?.denomination
    if (availableHitDie) return availableHitDie

    const classHitDice = actor?.items
        ?.filter(item => item.type === "class")
        ?.map(item => item.system?.hd?.denomination)
        ?.filter(Boolean) ?? []

    const sortedHitDice = [...classHitDice].sort((left, right) =>
        Number.parseInt(String(right).replace("d", "")) -
        Number.parseInt(String(left).replace("d", ""))
    )

    return sortedHitDice[0] ?? null
}
