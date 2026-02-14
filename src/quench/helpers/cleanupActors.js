// test/quench/helpers/cleanupActors.js
export async function cleanupQuenchTestActors(actorIds = [])
{
  if (!game?.actors) return

  let actorsToDelete
  if (actorIds.length > 0) {
    actorsToDelete = game.actors.filter(actor =>
      Array.isArray(actorIds) && actorIds.includes(actor.id)
    )
  } else {
    actorsToDelete = game.actors.filter(actor =>
      actor.flags.transformations?.testActor == true
    )
  }

  if (!actorsToDelete.length) return

  // Delete sequentially to avoid race conditions
  for (const actor of actorsToDelete) {
    try {
      await actor.delete()
    } catch (err) {
      console.warn(
        `Failed to delete test actor '${actor.name}'`,
        err
      )
    }
  }
}
