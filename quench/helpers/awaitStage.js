export async function waitForStageFinished(runtime, actor, waitForCondition, stage)
{
    await runtime.dependencies.utils.asyncTrackers.whenIdle()
    await waitForCondition(() =>
    {
        return actor.getFlag("transformations", "finishedStage") === stage
    })
}