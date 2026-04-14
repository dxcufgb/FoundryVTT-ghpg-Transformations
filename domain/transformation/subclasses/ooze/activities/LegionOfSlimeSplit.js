const TEMPLATE_PATH =
          "modules/transformations/scripts/templates/chatMessages/ooze-legion-of-slime-split-chat-card.hbs"

const CARD_SELECTOR =
          "[data-transformations-card][data-ooze-activity='legionOfSlimeSplit']"

const SIZE_ORDER = ["tiny", "sm", "med", "lg", "huge", "grg"]
const DUPLICATE_NAME_SUFFIX = " (Split Duplicate)"
const SPLIT_TOKEN_DIMENSION = 0.5
const DUPLICATE_ITEM_SOURCE_UUIDS = new Set([
    "Compendium.transformations.gh-transformations.Item.g8zsZxpHFQ2W3RNg",
    "Compendium.transformations.gh-transformations.Item.o28uVGWMiRiJvOcW",
    "Compendium.transformations.gh-transformations.Item.liaoB7q10vIfT38c"
])
const DUPLICATE_ITEM_TYPES_TO_KEEP = new Set([
    "race",
    "background",
    "feat",
    "class"
])

export class LegionOfSlimeSplit
{
    static id = "legionOfSlimeSplit"
    static itemSourceUuid = "Compendium.transformations.gh-transformations.Item.fHsLyQFcA6EEKhtg"
    static activitySourceUuid =
              "Compendium.transformations.gh-transformations.Item.fHsLyQFcA6EEKhtg.Activity.iJiKn5Qd6FqBPUct"

    static async activityUse({
        actor,
        token,
        item,
        message,
        ChatMessagePartInjector
    })
    {
        if (!actor || !message || !ChatMessagePartInjector) return

        const splitState = buildSplitState({actor, token})
        if (!splitState) return

        let duplicateActor = null

        try {
            duplicateActor = await createDuplicateActor({
                actor,
                item,
                splitState
            })

            if (!duplicateActor) {
                await setLegionOfSlimeDuplicateFlag(actor, null)
                await setLegionOfSlimeSplitState(actor, null)
                await this.renderState({
                    message,
                    ChatMessagePartInjector,
                    state: "error",
                    duplicateActorUuid: null,
                    duplicateActorName: null,
                    resultMessage: "Could not create the split duplicate actor."
                })
                return
            }

            await applySplitToOriginalActor({
                actor,
                token,
                item,
                message,
                splitState,
                duplicateActorUuid: duplicateActor.uuid
            })

            await this.renderState({
                message,
                ChatMessagePartInjector,
                state: "ready",
                duplicateActorUuid: duplicateActor.uuid,
                duplicateActorName: duplicateActor.name,
                resultMessage: null
            })
        } catch (error) {
            if (duplicateActor) {
                await duplicateActor.delete().catch(() => {})
            }
            await setLegionOfSlimeDuplicateFlag(actor, null).catch(() => {})
            await setLegionOfSlimeSplitState(actor, null).catch(() => {})

            console.error("Transformations | LegionOfSlimeSplit.activityUse failed", error)

            await this.renderState({
                message,
                ChatMessagePartInjector,
                state: "error",
                duplicateActorUuid: null,
                duplicateActorName: null,
                resultMessage: "Legion of Slime: Split failed."
            })
        }
    }

    static bind({
        actor,
        message,
        html,
        ChatMessagePartInjector,
        logger
    })
    {
        const root = resolveHtmlRoot(html)
        if (!root) return

        const card = root.matches?.(CARD_SELECTOR)
            ? root
            : root.querySelector?.(CARD_SELECTOR)
        if (!card) return

        if (card.dataset.oozeActivity !== this.id) return

        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async event =>
        {
            const button = event.target.closest("[data-transformations-action='placeDuplicate']")
            if (!button) return

            event.preventDefault()
            event.stopPropagation()

            button.disabled = true

            logger?.debug?.("LegionOfSlimeSplit.bind.placeDuplicate", {
                actor,
                message
            })

            const didPlaceDuplicate = await this.placeDuplicate({
                message,
                ChatMessagePartInjector
            })

            if (!didPlaceDuplicate) {
                button.disabled = false
            }
        })
    }

    static async placeDuplicate({
        message,
        ChatMessagePartInjector
    })
    {
        const duplicateActorUuid = message?.flags?.transformations?.duplicateActorUuid
        if (!duplicateActorUuid || !ChatMessagePartInjector) return false

        const duplicateActor = await fromUuid(duplicateActorUuid)
        if (!duplicateActor) {
            await this.renderState({
                message,
                ChatMessagePartInjector,
                state: "error",
                duplicateActorUuid: null,
                duplicateActorName: null,
                resultMessage: "The split duplicate actor no longer exists."
            })
            return false
        }

        const placedToken = await placeDuplicateTokenPreview(duplicateActor)
        if (!placedToken) return false

        await this.renderState({
            message,
            ChatMessagePartInjector,
            state: "placed",
            duplicateActorUuid,
            duplicateActorName: duplicateActor.name,
            resultMessage: `${duplicateActor.name} has been placed.`
        })

        return true
    }

    static async renderState({
        message,
        ChatMessagePartInjector,
        state,
        duplicateActorUuid,
        duplicateActorName,
        resultMessage
    })
    {
        await message.update({
            "flags.transformations.oozeActivity": this.id,
            "flags.transformations.state": state,
            "flags.transformations.duplicateActorUuid": duplicateActorUuid,
            "flags.transformations.duplicateActorName": duplicateActorName,
            "flags.transformations.resultMessage": resultMessage
        })

        const templateData = buildTemplateData({
            state,
            duplicateActorName,
            resultMessage
        })

        if (message.content?.includes?.("data-ooze-activity='legionOfSlimeSplit'") ||
            message.content?.includes?.("data-ooze-activity=\"legionOfSlimeSplit\"")) {
            await ChatMessagePartInjector.replaceCard({
                message,
                template: TEMPLATE_PATH,
                templateData
            })
            return
        }

        await ChatMessagePartInjector.inject({
            message,
            template: TEMPLATE_PATH,
            templateData,
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
        })
    }
}

export class LegionOfSlimeMerge
{
    static id = "legionOfSlimeMerge"
    static itemSourceUuid = LegionOfSlimeSplit.itemSourceUuid

    static async activityUse({
        actor,
        token,
        message
    })
    {
        if (!actor) return

        const duplicateActorUuid = getLegionOfSlimeDuplicateFlag(actor)
        const splitState = getLegionOfSlimeSplitState(actor)
        const duplicateActor = duplicateActorUuid
            ? await fromUuid(duplicateActorUuid).catch(() => null)
            : null

        const originalCurrentHp = getFiniteNumber(
            actor?.system?.attributes?.hp?.value,
            0
        )
        const originalMaxHp = getFiniteNumber(
            actor?.system?.attributes?.hp?.max,
            originalCurrentHp
        )
        const sourceMaxHp = getFiniteNumber(
            actor?._source?.system?.attributes?.hp?.max,
            originalMaxHp
        )
        const duplicateCurrentHp = getFiniteNumber(
            duplicateActor?.system?.attributes?.hp?.value,
            0
        )
        const duplicateMaxHp = getFiniteNumber(
            duplicateActor?.system?.attributes?.hp?.max,
            0
        )

        await removeLegionOfSlimeSplitEffects(actor, splitState?.splitEffectId)

        await restoreOriginalActorAfterMerge({
            actor,
            token,
            splitState,
            mergedCurrentHp: originalCurrentHp + duplicateCurrentHp,
            mergedMaxHp: Math.max(originalMaxHp + duplicateMaxHp, sourceMaxHp)
        })

        await removeDuplicateTokens(duplicateActor)
        await duplicateActor?.delete?.()

        if (message) {
            await message.update({
                "flags.transformations.resultMessage": "The duplicate merges back into the original ooze."
            }).catch(() => {})
        }
    }
}

function buildTemplateData({
    state,
    duplicateActorName,
    resultMessage
})
{
    return {
        activityId: LegionOfSlimeSplit.id,
        state,
        duplicateActorName,
        description: duplicateActorName
            ? `Create and place the split duplicate for ${duplicateActorName}.`
            : "Create and place the split duplicate.",
        resultMessage,
        canPlace: state === "ready"
    }
}

function buildSplitState({
    actor,
    token
})
{
    const currentSize = actor?.system?.traits?.size ?? "med"
    const nextSize = getNextSmallerSize(currentSize)
    const currentHp = getFiniteNumber(actor?.system?.attributes?.hp?.value, 0)
    const maxHp = getFiniteNumber(actor?.system?.attributes?.hp?.max, currentHp)

    const retainedCurrentHp = Math.ceil(currentHp / 2)
    const duplicateCurrentHp = Math.max(currentHp - retainedCurrentHp, 0)
    const retainedMaxHp = Math.ceil(maxHp / 2)
    const duplicateMaxHp = Math.max(maxHp - retainedMaxHp, 0)

    const prototypeTokenSource = getBaseTokenSource(actor, token)
    const splitPrototypeToken = buildSplitTokenSource({
        tokenSource: prototypeTokenSource
    })

    const currentTokenUpdate = token
        ? buildCurrentTokenUpdate()
        : null

    return {
        nextSize,
        original: {
            currentHp,
            retainedCurrentHp,
            retainedMaxHp,
            tokenWidth: getFiniteNumber(
                token?.width ??
                actor?.prototypeToken?.width,
                1
            ),
            tokenHeight: getFiniteNumber(
                token?.height ??
                actor?.prototypeToken?.height,
                1
            )
        },
        duplicate: {
            currentHp: duplicateCurrentHp,
            maxHp: duplicateMaxHp
        },
        splitPrototypeToken,
        currentTokenUpdate
    }
}

function getBaseTokenSource(actor, token)
{
    if (token?.toObject) return token.toObject()

    const actorToken =
              actor?.token?.document?.toObject?.() ??
              actor?.token?.toObject?.() ??
              null
    if (actorToken) return actorToken

    return actor?.prototypeToken?.toObject?.() ?? {}
}

function buildSplitTokenSource({
    tokenSource
})
{
    const splitTokenSource = foundry.utils.deepClone(tokenSource ?? {})

    delete splitTokenSource._id
    delete splitTokenSource.actorId
    delete splitTokenSource.delta
    delete splitTokenSource.x
    delete splitTokenSource.y
    delete splitTokenSource.elevation
    delete splitTokenSource.sort
    delete splitTokenSource.lockRotation

    splitTokenSource.width = SPLIT_TOKEN_DIMENSION
    splitTokenSource.height = SPLIT_TOKEN_DIMENSION

    return normalizeTokenData(splitTokenSource)
}

function buildCurrentTokenUpdate()
{
    return {
        width: SPLIT_TOKEN_DIMENSION,
        height: SPLIT_TOKEN_DIMENSION
    }
}

async function createDuplicateActor({
    actor,
    item,
    splitState
})
{
    if (!actor?.clone) return null

    const duplicateName = `${actor.name}${DUPLICATE_NAME_SUFFIX}`
    const duplicateToken = normalizeTokenData(
        foundry.utils.deepClone(splitState.splitPrototypeToken)
    )
    duplicateToken.name = duplicateName

    const duplicateActor = await actor.clone({
        name: duplicateName,
        "system.attributes.hp.value": splitState.duplicate.currentHp,
        "system.attributes.hp.max": splitState.duplicate.maxHp,
        "system.traits.size": splitState.nextSize,
        prototypeToken: duplicateToken,
        flags: {
            transformations: {
                ...(actor.flags?.transformations ?? {}),
                ooze: {
                    ...(actor.flags?.transformations?.ooze ?? {}),
                    temporarySplitDuplicate: true,
                    splitSourceActorUuid: actor.uuid,
                    splitItemSourceUuid:
                        item?.flags?.transformations?.sourceUuid ??
                        item?.uuid ??
                        LegionOfSlimeSplit.itemSourceUuid,
                    splitActivitySourceUuid: LegionOfSlimeSplit.activitySourceUuid,
                    createdByUserId: game.user?.id ?? null
                }
            }
        }
    }, {
        save: true,
        addSource: true
    })

    await pruneDuplicateItems(duplicateActor)
    await ensureDuplicateItems(duplicateActor)

    return duplicateActor
}

async function applySplitToOriginalActor({
    actor,
    token,
    item,
    message,
    splitState,
    duplicateActorUuid
})
{
    const effectChanges = [
        {
            key: "system.traits.size",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: splitState.nextSize
        },
        {
            key: "system.attributes.hp.max",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: String(splitState.original.retainedMaxHp)
        },
        {
            key: "prototypeToken.width",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: String(splitState.splitPrototypeToken.width)
        },
        {
            key: "prototypeToken.height",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: String(splitState.splitPrototypeToken.height)
        }
    ]

    const [splitEffect] = await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: "Legion of Slime: Split",
        description: "This actor has split into a smaller ooze duplicate.",
        icon:
            item?.img ??
            actor?.img ??
            "icons/skills/melee/unarmed-punch-fist.webp",
        changes: effectChanges,
        origin:
            item?.uuid ??
            item?.flags?.transformations?.sourceUuid ??
            actor?.uuid ??
            "",
        flags: {
            transformations: {
                addedByTransformation: true,
                source: "oozeSplit",
                oozeSplit: true,
                messageId: message?.id ?? null,
                token: token?.id
                    ? {
                        sceneId: token.parent?.id ?? null,
                        tokenId: token.id
                    }
                    : null
            },
            ddbimporter: {
                ignoreItemImport: true
            }
        }
    }])

    // Current HP is updated on the source once so the split does not freeze
    // the actor's HP at a fixed prepared value while the effect remains active.
    await actor.update({
        "system.attributes.hp.value": splitState.original.retainedCurrentHp,
        "flags.transformations.ooze.legionOfSlimeDuplicate": duplicateActorUuid
    })
    await setLegionOfSlimeSplitState(actor, {
        splitEffectId: splitEffect?.id ?? null,
        originalTokenWidth: splitState.original.tokenWidth,
        originalTokenHeight: splitState.original.tokenHeight
    })

    if (token && splitState.currentTokenUpdate) {
        await token.update(splitState.currentTokenUpdate)
    }
}

async function placeDuplicateTokenPreview(actor)
{
    if (!canvas?.ready || !canvas?.scene || !canvas?.tokens) {
        ui.notifications?.warn?.("An active scene is required to place the duplicate token.")
        return null
    }

    const tokenDocument = await actor.getTokenDocument({
        sort: Math.max((canvas.tokens.getMaxSort?.() ?? -1) + 1, 0)
    }, {parent: canvas.scene})
    const tokenData = normalizeTokenData(tokenDocument.toObject(false))

    const preview = await canvas.tokens._createPreview(
        tokenData,
        {renderSheet: false}
    )
    if (!preview) return null

    const layer = canvas.tokens
    const initialLayer = canvas.activeLayer

    return new Promise(resolve =>
    {
        const events = {
            move: event =>
            {
                event.stopPropagation()

                const center = event.data.getLocalPosition(layer)
                if (!canvas.dimensions.rect.contains(center.x, center.y)) return

                const destination = CONFIG.Token.objectClass._getDropActorPosition(
                    preview.document,
                    {
                        x: center.x,
                        y: center.y,
                        elevation: preview.document.elevation ?? 0
                    },
                    {snap: !event.shiftKey}
                )

                updatePreviewToken(preview, destination)
            },
            confirm: async event =>
            {
                if ((event.button != null) && (event.button !== 0)) return
                event.stopPropagation()

                try {
                    const createData = normalizeTokenData(
                        preview.document.toObject(false)
                    )
                    const [created] = await canvas.scene.createEmbeddedDocuments(
                        "Token",
                        [createData]
                    )

                    cleanup()
                    resolve(created ?? null)
                } catch (error) {
                    cleanup()
                    console.error("Transformations | LegionOfSlimeSplit.placeDuplicateTokenPreview failed", error)
                    ui.notifications?.error?.("Could not place the split duplicate token.")
                    resolve(null)
                }
            },
            cancel: event =>
            {
                event?.stopPropagation?.()
                cleanup()
                resolve(null)
            }
        }

        const cleanup = () =>
        {
            canvas.stage.off("mousemove", events.move)
            canvas.stage.off("mouseup", events.confirm)
            canvas.app.view.oncontextmenu = null
            layer.clearPreviewContainer()
            initialLayer?.activate?.()
        }

        layer.activate()
        canvas.stage.on("mousemove", events.move)
        canvas.stage.on("mouseup", events.confirm)
        canvas.app.view.oncontextmenu = events.cancel
    })
}

async function pruneDuplicateItems(actor)
{
    if (!actor?.items) return

    const itemIdsToRemove = actor.items
    .filter(item =>
        !DUPLICATE_ITEM_TYPES_TO_KEEP.has(item?.type) &&
        !DUPLICATE_ITEM_SOURCE_UUIDS.has(resolveItemSourceUuid(item))
    )
    .map(item => item.id)

    if (!itemIdsToRemove.length) return

    await actor.deleteEmbeddedDocuments("Item", itemIdsToRemove)
}

async function ensureDuplicateItems(actor)
{
    if (!actor?.items) return

    for (const uuid of DUPLICATE_ITEM_SOURCE_UUIDS) {
        const alreadyPresent = actor.items.some(item =>
            resolveItemSourceUuid(item) === uuid
        )
        if (alreadyPresent) continue

        const sourceItem = await fromUuid(uuid)
        if (!sourceItem) continue

        const itemData =
                  typeof sourceItem?.toObject === "function"
                      ? foundry.utils.deepClone(sourceItem.toObject())
                      : foundry.utils.deepClone(sourceItem)
        if (!itemData || typeof itemData !== "object") continue

        itemData.flags ??= {}
        itemData.flags.transformations = {
            ...(itemData.flags.transformations ?? {}),
            sourceUuid: uuid,
            addedByTransformation: true
        }
        itemData.flags.ddbimporter = {
            ...(itemData.flags.ddbimporter ?? {}),
            ignoreItemImport: true
        }

        await actor.createEmbeddedDocuments("Item", [itemData])
    }
}

async function setLegionOfSlimeDuplicateFlag(actor, duplicateActorUuid)
{
    if (!actor) return

    await actor.update({
        "flags.transformations.ooze.legionOfSlimeDuplicate": duplicateActorUuid
    })
}

function getLegionOfSlimeDuplicateFlag(actor)
{
    return (
        actor?.flags?.transformations?.ooze?.legionOfSlimeDuplicate ??
        actor?.getFlag?.("transformations", "ooze")?.legionOfSlimeDuplicate ??
        null
    )
}

async function setLegionOfSlimeSplitState(actor, splitState)
{
    if (!actor) return

    await actor.update({
        "flags.transformations.ooze.legionOfSlimeSplitState": splitState
    })
}

function getLegionOfSlimeSplitState(actor)
{
    return (
        actor?.flags?.transformations?.ooze?.legionOfSlimeSplitState ??
        actor?.getFlag?.("transformations", "ooze")?.legionOfSlimeSplitState ??
        null
    )
}

async function removeLegionOfSlimeSplitEffects(actor, splitEffectId = null)
{
    if (!actor?.effects) return

    const effectIds = actor.effects
    .filter(effect =>
        effect?.id === splitEffectId ||
        effect?.flags?.transformations?.oozeSplit === true ||
        effect?.name === "Legion of Slime: Split"
    )
    .map(effect => effect.id)

    if (!effectIds.length) return

    await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds)
}

async function restoreOriginalActorAfterMerge({
    actor,
    token,
    splitState,
    mergedCurrentHp,
    mergedMaxHp
})
{
    if (!actor) return

    await actor.update({
        "system.attributes.hp.value": Math.min(mergedCurrentHp, mergedMaxHp),
        "system.attributes.hp.max": mergedMaxHp,
        "flags.transformations.ooze.legionOfSlimeDuplicate": null,
        "flags.transformations.ooze.legionOfSlimeSplitState": null
    })

    const restoreUpdate = {
        width: getFiniteNumber(
            splitState?.originalTokenWidth ??
            actor?.prototypeToken?.width,
            1
        ),
        height: getFiniteNumber(
            splitState?.originalTokenHeight ??
            actor?.prototypeToken?.height,
            1
        )
    }

    const tokenDocuments = collectActorTokenDocuments(actor, token)
    for (const tokenDocument of tokenDocuments) {
        await tokenDocument.update(restoreUpdate)
    }
}

function collectActorTokenDocuments(actor, token = null)
{
    const tokenDocuments = new Map()

    const explicitTokenDocument =
              token?.document ??
              token ??
              null
    if (explicitTokenDocument?.id) {
        tokenDocuments.set(explicitTokenDocument.id, explicitTokenDocument)
    }

    for (const tokenDocument of actor?.getActiveTokens?.(true, true) ?? []) {
        if (!tokenDocument?.id) continue
        tokenDocuments.set(tokenDocument.id, tokenDocument)
    }

    return Array.from(tokenDocuments.values())
}

async function removeDuplicateTokens(duplicateActor)
{
    if (!duplicateActor?.id || !game?.scenes) return

    for (const scene of game.scenes) {
        const tokenIds = scene.tokens
        .filter(tokenDocument => tokenDocument.actorId === duplicateActor.id)
        .map(tokenDocument => tokenDocument.id)

        if (!tokenIds.length) continue

        await scene.deleteEmbeddedDocuments("Token", tokenIds)
    }
}

function resolveItemSourceUuid(item)
{
    return (
        item?.flags?.transformations?.sourceUuid ??
        item?.flags?.core?.sourceId ??
        item?._stats?.compendiumSource ??
        item?.uuid ??
        null
    )
}

function normalizeTokenData(tokenData = {})
{
    const normalized = foundry.utils.deepClone(tokenData ?? {})

    if (Array.isArray(normalized.detectionModes)) {
        normalized.detectionModes = normalized.detectionModes
        .filter(mode => mode && typeof mode === "object")
        .map(mode => ({
            ...mode,
            range: getFiniteNumber(mode.range, 0)
        }))
    }

    if (normalized.sight && typeof normalized.sight === "object") {
        normalized.sight.range = getFiniteNumber(normalized.sight.range, 0)
    }

    return normalized
}

function updatePreviewToken(preview, destination)
{
    const source = preview.document
    const {x, y, elevation, width, height, shape} = destination

    const refreshPosition = (source.x !== x) || (source.y !== y)
    const refreshElevation = source.elevation !== elevation
    const refreshSize = (source.width !== width) || (source.height !== height)
    const refreshShape = source.shape !== shape

    source.x = x
    source.y = y
    source.elevation = elevation
    source.width = width
    source.height = height
    source.shape = shape

    preview.renderFlags.set({
        refreshPosition,
        refreshElevation,
        refreshSize,
        refreshShape
    })
}

function getNextSmallerSize(currentSize)
{
    const currentIndex = SIZE_ORDER.indexOf(currentSize)
    if (currentIndex <= 0) return SIZE_ORDER[0]
    return SIZE_ORDER[currentIndex - 1]
}

function getFiniteNumber(value, fallback)
{
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : fallback
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}
