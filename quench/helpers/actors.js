import { ROLL_TYPE } from "../../config/constants.js"
import { getRandomFileInFolder } from "./getRandomFilename.js"
import { getOrCreateItem } from "./item.js"
import { actorValidator } from "./validators/actorValidator.js"
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
            abilities: {
                str: { value: 10 },
                dex: { value: 10 },
                con: { value: 10 },
                int: { value: 10 },
                wis: { value: 10 },
                cha: { value: 10 }
            },
            attributes: {
                hp: {
                    value: 10,
                    max: 10
                },
                movement: {
                    walk: 30
                }
            },
            spells: {}
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
        const raceItem = await getOrCreateItem({
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
    console.error("Transformations TEST | OLD Method called, migrate to new actorValidator function!")
    return actorValidator({ actor, expect }).expectItemsOnActor(expectedItemUuids)
}

export function expectRaceItemSubTypeOnActor(runtime, subtype, actor, expect)
{
    console.error("Transformations TEST | OLD Method called, migrate to new actorValidator function!")
    return actorValidator({ runtime, actor, expect }).expectRaceItemSubTypeOnActor(runtime, subtype, actor, expect)
}

export async function applyItemActivityEffect({ actor, itemName, effectName, macroTrigger = "manual" })
{
    const item = actor.items.find(i => i.name === itemName)
    const effect = item.effects.find(e => e.name == effectName)
    await simulateItemMacro(effect, actor, { trigger: macroTrigger })
    await actor.createEmbeddedDocuments("ActiveEffect", [effect])
}

export async function simulateItemMacro(effect, actor, {
    trigger,
    transformationType,
    action,
    args = {}
} = {})
{

    const macroChange = effect.changes.find(c =>
        c.key === "macro.itemMacro"
    )

    if (!macroChange) return false

    // The value string: "aberrantHorror slimyForm"
    const [type, act] = macroChange.value.split(" ")

    const tokenDoc = await createTestTokenForActor(actor)

    await game.transformations.executeMacro({
        trigger,
        transformationType: transformationType ?? type,
        action: action ?? act,
        args: {
            actorUuid: actor.uuid,
            tokenUuid: tokenDoc.uuid, // fallback for tests
            ...args
        },
        actor
    })

    await removeTestToken(tokenDoc)

    return true
}

export async function createTestTokenForActor(actor)
{
    if (!game.scenes.active) {
        const scene = await Scene.create({
            name: "Transformation Test Scene",
            active: true
        })
        await scene.activate()
    }

    const tokenData = await actor.getTokenDocument()

    const created = await game.scenes.active.createEmbeddedDocuments(
        "Token",
        [tokenData.toObject()]
    )

    const tokenDoc = created[0]

    return tokenDoc
}

export async function removeTestToken(tokenDoc)
{
    if (!tokenDoc?.parent) return
    await tokenDoc.parent.deleteEmbeddedDocuments("Token", [tokenDoc.id])
}

export function validateAllD20Disadvantage(actor, actorEffectValidator, assert)
{
    console.error("Transformations TEST | OLD Method called, migrate to new actorValidator function!")
    return actorValidator({ actor, assert }).validateAllD20Disadvantage()
}