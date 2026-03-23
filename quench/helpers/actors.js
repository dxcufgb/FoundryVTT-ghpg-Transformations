import { Registry } from "../../bootstrap/registry.js"
import { getRandomFileInFolder } from "./getRandomFilename.js"
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
                str: {value: 10},
                dex: {value: 10},
                con: {value: 10},
                int: {value: 10},
                wis: {value: 10},
                cha: {value: 10}
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
        const raceItem = await getCharacterRace("Human")

        await createActorItemAndWait(
            actor,
            raceItem,
            {
                setTransformationFlags: false,
                setDdbImporterFlag: false,
                applyAdvancements: false
            }
        )
    }
    if (options?.classes) {
        for (const characterClass of options.classes) {
            const foundCharacterClass = await getCharacterClass(characterClass)
            await createActorItemAndWait(
                actor,
                foundCharacterClass,
                {
                    setTransformationFlags: false,
                    setDdbImporterFlag: false,
                    applyAdvancements: false
                }
            )
        }
    }
}

export async function createActorItemAndWait(actor, sourceItem, options = {})
{
    const createdItem = await Registry.infrastructure.itemRepository.createObjectOnActor(
        actor,
        sourceItem,
        "",
        options
    )

    if (!createdItem) {
        return null
    }

    await waitForActorItems(actor, [createdItem], {
        errorMessage:
            `Timed out waiting for actor ${actor.name} to contain item ${createdItem.name ?? sourceItem?.name ?? createdItem.id}`
    })

    return actor.items.get(createdItem.id) ?? createdItem
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

    let changeSeen = true
    let stablePasses = 0
    let lastModified = actor._stats?.modifiedTime
    let lastItemSignature = getActorItemSignature(actor)

    function onUpdate(updatedActor)
    {
        if (updatedActor.id === actor.id) {
            changeSeen = true
        }
    }

    function onItemChange(item)
    {
        if (item?.parent?.id === actor.id) {
            changeSeen = true
        }
    }

    Hooks.on("updateActor", onUpdate)
    Hooks.on("createItem", onItemChange)
    Hooks.on("updateItem", onItemChange)
    Hooks.on("deleteItem", onItemChange)

    try {
        while (true) {
            // allow Foundry + modules to run
            await new Promise(r => setTimeout(r, idleMs))

            const currentModified = actor._stats?.modifiedTime
            const currentItemSignature = getActorItemSignature(actor)

            // actor/item state changed AND stabilized
            if (
                changeSeen &&
                currentModified === lastModified &&
                currentItemSignature === lastItemSignature
            )
            {
                stablePasses += 1
                if (stablePasses >= 2) {
                    // one final microtask flush
                    await Promise.resolve()
                    return
                }
            } else {
                stablePasses = 0
            }

            lastModified = currentModified
            lastItemSignature = currentItemSignature

            if (Date.now() - start > timeoutMs) {
                throw new Error("Timed out waiting for actor consistency")
            }
        }
    } finally {
        Hooks.off("updateActor", onUpdate)
        Hooks.off("createItem", onItemChange)
        Hooks.off("updateItem", onItemChange)
        Hooks.off("deleteItem", onItemChange)
    }
}

export async function waitForActorItems(actor, expectedItems = [], {
    timeout = 2000,
    interval = 10,
    errorMessage = "Timed out waiting for actor items"
}                                                            = {})
{
    const normalizedExpectedItems = Array.isArray(expectedItems)
        ? expectedItems
        : [expectedItems]
    const filteredExpectedItems = normalizedExpectedItems.filter(Boolean)

    if (!actor || !filteredExpectedItems.length) {
        return
    }

    return waitFor({
        predicate: () =>
            filteredExpectedItems.every(expectedItem =>
                actorHasExpectedItem(actor, expectedItem)
            ),
        timeout,
        interval,
        errorMessage
    })
}

export function expectItemsOnActor(expectedItemUuids, actor, expect)
{
    console.error("Transformations TEST | OLD Method called, migrate to new actorValidator function!")
    return actorValidator({actor, expect}).expectItemsOnActor(expectedItemUuids)
}

export function expectRaceItemSubTypeOnActor(runtime, subtype, actor, expect)
{
    console.error("Transformations TEST | OLD Method called, migrate to new actorValidator function!")
    return actorValidator({runtime, actor, expect}).expectRaceItemSubTypeOnActor(runtime, subtype, actor, expect)
}

export async function applyItemActivityEffect({actor, itemName, effectName, macroTrigger = "manual"})
{
    const item = actor.items.find(i => i.name === itemName)
    const effect = item.effects.find(e => e.name == effectName)
    await simulateItemMacro(effect, actor, {trigger: macroTrigger})
    await actor.createEmbeddedDocuments("ActiveEffect", [effect.toObject()])
    await Promise.resolve()
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
    return actorValidator({actor, assert}).validateAllD20Disadvantage()
}

export async function getCharacterClass(characterClass)
{
    const pack = game.packs.get("dnd5e.classes24")

    await pack.getIndex()

    const classEntry = pack.index.find(e => e.name === characterClass)

    return await pack.getDocument(classEntry._id)
}

export async function getCharacterRace(characterRace)
{
    const pack = game.packs.get("dnd5e.races")

    await pack.getIndex()

    const raceEntry = pack.index.find(e => e.name === characterRace)
    const raceDocument = await pack.getDocument(raceEntry._id)

    return raceDocument
}

function getActorItemSignature(actor)
{
    return Array.from(actor.items ?? [])
    .map(item => item.id)
    .sort()
    .join("|")
}

function actorHasExpectedItem(actor, expectedItem)
{
    const items = Array.from(actor.items ?? [])

    if (typeof expectedItem === "string") {
        return items.some(item =>
            item.id === expectedItem ||
            item.name === expectedItem ||
            item.uuid === expectedItem ||
            item.flags?.transformations?.sourceUuid === expectedItem
        )
    }

    const expectedId = expectedItem.id ?? expectedItem._id
    const expectedName = expectedItem.name
    const expectedUuid = expectedItem.uuid
    const expectedSourceUuid =
              expectedItem.sourceUuid ??
              expectedItem.flags?.transformations?.sourceUuid

    return items.some(item =>
        (expectedId && item.id === expectedId) ||
        (expectedName && item.name === expectedName) ||
        (expectedUuid && item.uuid === expectedUuid) ||
        (expectedSourceUuid &&
            item.flags?.transformations?.sourceUuid === expectedSourceUuid)
    )
}
