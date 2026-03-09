export function getStageDef(definition, stageNumber, expect)
{
    const stage = Object.values(definition.stages)
        .find(s => s.stage === stageNumber)

    expect(stage, `Stage ${stageNumber} definition missing`).to.exist

    return stage
}

export function getNonPrerequisiteChoice(stageDef, expect)
{
    const choice = stageDef.choices?.items
        ?.find(c => c.prerequisite !== true)

    expect(choice, "No non-prerequisite choice defined").to.exist

    return choice
}


export function getDependentChoice(nextStageDef, prerequisiteUuid, expect)
{
    const choice = nextStageDef.choices?.items
        ?.find(c =>
            c.requires?.items?.includes(prerequisiteUuid)
        )

    expect(
        choice,
        `No dependent choice linked to prerequisite ${prerequisiteUuid}`
    ).to.exist

    return choice
}

export function getNonDependentChoice(stageDef, expect)
{
    const choice = stageDef.choices?.items
        ?.find(c => !c.requires?.items?.length)

    expect(choice, "No non-dependent choice defined").to.exist

    return choice
}
