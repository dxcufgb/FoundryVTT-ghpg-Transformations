import { getRandomFileInFolder } from "./getRandomFilename.js"
import { waitFor } from "./waitFor.js"

export async function createTestActor({
    name = "Test Actor",
    type = "character",
    testUUID,
    options = {}
} = {})
{
    const actorImage = await getRandomFileInFolder("modules/transformations/scripts/quench/img/")
    let actorMap = {
        name: name,
        type: type,
        img: actorImage,
        flags: {
            transformations: {
                testActor: true
            }
        },
        system: {
            attributes: {
                hp: { value: 10, max: 10 }
            }
        }
    }
    handlePreCreationExtras(actorMap, options)
    const actor = await Actor.create(actorMap)
    await handlePostCreationExtras(actor, options)
    return actor
}

function handlePreCreationExtras(actorMap, options)
{
    //nothing as of yet
}

async function handlePostCreationExtras(actor, options)
{
    if (options?.race) {
        const raceItem = await Item.create({
            name: "Human",
            type: "race",
            system: {}
        })

        await actor.createEmbeddedDocuments("Item", [
            raceItem.toObject()
        ])
    }
}

export async function waitForFlagUpdate({
    actor,
    scope,
    key,
    expected
})
{
    return await waitFor({
        predicate: () =>
            actor.getFlag(scope, key) === expected,
        errorMessage:
            `Timed out waiting for flag ${scope}.${key} to be ${expected}, was ${actor.flags?.[scope]?.[key]}`
    })
}


export async function waitForActorConsistency(actor, {
    timeoutMs = 1500,
    idleMs = 20
} = {})
{
    const start = Date.now()

    let updateSeen = false
    let lastModified = actor._stats?.modifiedTime

    function onUpdate(updatedActor)
    {
        if (updatedActor.id === actor.id) {
            updateSeen = true
        }
    }

    Hooks.on("updateActor", onUpdate)

    try {
        while (true) {
            // allow Foundry + modules to run
            await new Promise(r => setTimeout(r, idleMs))

            const currentModified = actor._stats?.modifiedTime

            // actor updated AND stabilized
            if (
                updateSeen &&
                currentModified &&
                currentModified === lastModified
            ) {
                // one final microtask flush
                await Promise.resolve()
                return
            }

            lastModified = currentModified

            if (Date.now() - start > timeoutMs) {
                throw new Error("Timed out waiting for actor consistency")
            }
        }
    } finally {
        Hooks.off("updateActor", onUpdate)
    }
}

export function expectItemsOnActor(expectedItemUuids, actor, expect)
{
    const actorSourceIds = actor.items.map(i =>
        i.flags.transformations?.sourceUuid
    )
    for (const uuid of expectedItemUuids) {
        expect(
            actorSourceIds.includes(uuid),
            `Expected UUID ${uuid} was not found on actor`
        ).to.equal(true)
    }
}

export function expectRaceItemSubTypeOnActor(runtime, subtype, actor, expect)
{
    const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")
    expect(raceItem?.system?.type?.subtype).to.be.equal(subtype)
}