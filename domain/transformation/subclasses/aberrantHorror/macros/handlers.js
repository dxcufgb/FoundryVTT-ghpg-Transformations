export function createAberrantHorrorMacroHandlers({
    activeEffectRepository,
    itemRepository,
    getDialogFactory = () => null,
    tracker,
    logger
})
{
    logger.debug("createAberrantHorrorMacroHandlers", {
        activeEffectRepository,
        itemRepository,
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        async chitinousShell({ actor, trigger })
        {
            logger.debug("createAberrantHorrorMacroHandlers.chitinousShell", { actor, trigger })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "on") return

                    const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                        n => n !== aberrantMutationConstants.effects.chitinousShell
                    )

                    const effectIds = activeEffectRepository.findAllByName(actor, effectNames)

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )
                    await removeEldritchLimbsItem(actor)
                    await poisonousMutations({ actor, trigger })
                })()
            )
        },

        async eldritchLimbs({ actor, trigger, triggeringUserId = null })
        {
            logger.debug("createAberrantHorrorMacroHandlers.eldritchLimbs", { actor, trigger, triggeringUserId })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "on") return

                    const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                        n => n !== aberrantMutationConstants.effects.eldritchLimbs
                    )

                    const effectIds = activeEffectRepository.findAllByName(actor, effectNames)

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )

                    const damageType = await chooseEldritchLimbsDamageType(actor, triggeringUserId)
                    await addEldritchLimbsItem(actor, damageType)
                    await poisonousMutations({ actor, trigger })
                })()
            )
        },

        async slimyForm({ actor, trigger })
        {
            logger.debug("createAberrantHorrorMacroHandlers.slimyForm", { actor, trigger })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "on") return

                    const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                        n => n !== aberrantMutationConstants.effects.slimyForm
                    )

                    const effectIds = activeEffectRepository.findAllByName(actor, effectNames)

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )
                    await removeEldritchLimbsItem(actor)
                    await poisonousMutations({ actor, trigger })
                })()
            )
        },

        async removeAberrantMutationEffects({ actor, trigger })
        {
            logger.debug("createAberrantHorrorMacroHandlers.removeAberrantMutationEffects", { actor, trigger })
            return tracker.track(
                (async () =>
                {
                    if (trigger !== "longRest") return

                    const effectIds = activeEffectRepository.findAllByName(
                        actor,
                        Object.values(aberrantMutationConstants.effects)
                    )

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )
                    await removeEldritchLimbsItem(actor)
                })()
            )
        }
    })

    async function chooseEldritchLimbsDamageType(actor, triggeringUserId)
    {
        logger.debug("createAberrantHorrorMacroHandlers.chooseEldritchLimbsDamageType", { actor, triggeringUserId })
        const dialogFactory = getDialogFactory?.()
        if (!dialogFactory?.openTransformationGeneralChoiceDialog) {
            logger.warn("Eldritch Limbs damage type choice requested without dialogFactory")
            return null
        }

        const damageTypes = globalThis.CONFIG?.DND5E?.damageTypes ?? {}
        const selected = await dialogFactory.openTransformationGeneralChoiceDialog({
            actor,
            choices: aberrantMutationConstants.eldritchLimbsDamageTypes.map(type => ({
                id: type,
                icon: damageTypes[type]?.icon ?? aberrantMutationConstants.eldritchLimbsIcon,
                label: damageTypeLabel(type)
            })),
            title: "Eldritch Limbs: choose damage type",
            description: "Choose the damage type your Eldritch Limbs deal.",
            triggeringUserId
        })

        const damageType = Array.isArray(selected) ? selected[0] : selected
        return aberrantMutationConstants.eldritchLimbsDamageTypes.includes(damageType)
            ? damageType
            : null
    }

    async function addEldritchLimbsItem(actor, damageType = null)
    {
        logger.debug("createAberrantHorrorMacroHandlers.addEldritchLimbsItem", { actor, damageType })
        return tracker.track(
            (async () =>
            {
                if (actorHasEfficientKiller(actor)) {
                    const variants = aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller
                    // Without a choice (dialog cancelled) fall back to granting every variant.
                    const uuids = damageType
                        ? [variants[damageType]]
                        : Object.values(variants)

                    for (const uuid of uuids) {
                        await itemRepository.addItemFromUuid({
                            actor,
                            uuid,
                            flags: {
                                removeOnLongRest: true,
                                removeOnShortRest: true
                            }
                        })
                    }
                } else {

                    const uuid = aberrantMutationConstants.items.eldritchLimbs.normal

                    const created = await itemRepository.addItemFromUuid({
                        actor,
                        uuid,
                        flags: {
                            removeOnLongRest: true,
                            removeOnShortRest: true
                        }
                    })

                    if (created && damageType) {
                        await applyEldritchLimbsDamageType(created, damageType)
                    }
                }
            })()
        )
    }

    async function applyEldritchLimbsDamageType(item, damageType)
    {
        logger.debug("createAberrantHorrorMacroHandlers.applyEldritchLimbsDamageType", { item, damageType })
        const updates = {}

        for (const activity of item.system?.activities ?? []) {
            const parts = activity.damage?.parts
            if (!parts?.length) continue

            updates[`system.activities.${activity.id}.damage.parts`] = parts.map(part => ({
                ...(typeof part.toObject === "function" ? part.toObject() : foundry.utils.deepClone(part)),
                types: [damageType]
            }))
        }

        if (item.system?.damage?.base) {
            updates["system.damage.base.types"] = [damageType]
        }

        updates.name = `${item.name} (${damageTypeLabel(damageType)})`

        await item.update(updates)
    }

    async function removeEldritchLimbsItem(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.removeEldritchLimbsItem", { actor })
        return tracker.track(
            (async () =>
            {
                if (actorHasEfficientKiller(actor)) {
                    for (const uuid of Object.values(aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller)) {
                        const eldritchLimbs = await itemRepository.findEmbeddedByUuidFlag(actor, uuid)

                        if (!eldritchLimbs) continue
                        const id = eldritchLimbs.id

                        await itemRepository.deleteEmbedded(actor, [id])
                    }
                } else {
                    const uuid = aberrantMutationConstants.items.eldritchLimbs.normal

                    if (!uuid) return

                    const eldritchLimbs = await itemRepository.findEmbeddedByUuidFlag(actor, uuid)

                    if (!eldritchLimbs) return
                    const id = eldritchLimbs.id

                    await itemRepository.deleteEmbedded(actor, [id])
                }
            })()
        )
    }

    function damageTypeLabel(damageType)
    {
        const label = globalThis.CONFIG?.DND5E?.damageTypes?.[damageType]?.label
        return label ? game.i18n.localize(label) : damageType.capitalize()
    }

    function actorHasEfficientKiller(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.actorHasEfficientKiller", { actor })
        return itemRepository.findEmbeddedByUuidFlag(
            actor,
            aberrantMutationConstants.items.efficientKiller
        )
    }

    async function poisonousMutations({ actor, trigger })
    {
        const currentActorStage = await actor.getFlag("transformations", "stage")
        if (currentActorStage < 4) return
        const poisonousMutationsItem = await itemRepository.findEmbeddedByUuidFlag(actor, aberrantMutationConstants.items.poisonousMutations)
        if (!poisonousMutationsItem) return
        const poisonousMutationsEffect = poisonousMutationsItem.effects.contents.find(e => e.name == "Poisonous Mutations")
        if (!poisonousMutationsEffect) return

        if (
            poisonousMutationsEffect.transfer === true ||
            activeEffectRepository.hasByName(
                actor,
                aberrantMutationConstants.effects.poisonousMutations
            )
        ) {
            return
        }

        await activeEffectRepository.create({
            actor,
            name: poisonousMutationsEffect.name,
            description: poisonousMutationsEffect.description,
            icon: poisonousMutationsEffect.img,
        })
    }
}

export const aberrantMutationConstants = Object.freeze({
    effects: {
        chitinousShell: "Chitinous Shell",
        slimyForm: "Slimy Form",
        eldritchLimbs: "Eldritch Limbs",
        poisonousMutations: "Poisonous Mutations"
    },
    eldritchLimbsDamageTypes: ["bludgeoning", "piercing", "slashing"],
    eldritchLimbsIcon: "modules/transformations/Icons/Transformations/Aberrant%20Horror/Eldritch_Limbs.png",
    items: {
        eldritchLimbs: {
            normal: 'Compendium.transformations.gh-transformations.Item.6WiJSiBbhYTH80Da',
            withEfficientKiller: {
                // 'Compendium.transformations.gh-transformations.Item.FVXkz256XPi1Uluv',
                slashing: "Compendium.transformations.gh-transformations.Item.Xl21IUgjd3Wbsk3m",
                piercing: "Compendium.transformations.gh-transformations.Item.naciCscJgzP21JiY",
                bludgeoning: "Compendium.transformations.gh-transformations.Item.benNIPNjkWikc3pL"
            }
        },
        efficientKiller: 'Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq',
        poisonousMutations: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
    }
})
