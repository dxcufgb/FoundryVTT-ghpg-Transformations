export function createFeyMacroHandlers({
    activeEffectRepository,
    itemRepository,
    tracker,
    logger
})
{
    logger.debug("createFeyMacroHandlers", {
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

        async eldritchLimbs({ actor, trigger })
        {
            logger.debug("createAberrantHorrorMacroHandlers.eldritchLimbs", { actor, trigger })
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

                    await addEldritchLimbsItem(actor)
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

    async function addEldritchLimbsItem(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.addEldritchLimbsItem", { actor })
        return tracker.track(
            (async () =>
            {
                if (actorHasEfficientKiller(actor)) {
                    for (const uuid of aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller) {
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

                    await itemRepository.addItemFromUuid({
                        actor,
                        uuid,
                        flags: {
                            removeOnLongRest: true,
                            removeOnShortRest: true
                        }
                    })
                }
            })()
        )
    }

    async function removeEldritchLimbsItem(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.removeEldritchLimbsItem", { actor })
        return tracker.track(
            (async () =>
            {
                if (actorHasEfficientKiller(actor)) {
                    for (const uuid of aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller) {
                        const eldritchLimbs = await itemRepository.findEmbeddedByUuidFlag(actor, uuid)

                        if (!eldritchLimbs) return
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
        const poisonousMutations = await activeEffectRepository.findByName(actor, "poisonous Mutations")
        if (poisonousMutations) return
        const poisonousMutationsEffect = poisonousMutationsItem.effects.contents.find(e => e.name == "Poisonous Mutations")
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
        poisonousMutations: "Poisonous, Mutations"
    },
    items: {
        eldritchLimbs: {
            normal: 'Compendium.transformations.gh-transformations.Item.6WiJSiBbhYTH80Da',
            withEfficientKiller: [
                // 'Compendium.transformations.gh-transformations.Item.FVXkz256XPi1Uluv',
                "Compendium.transformations.gh-transformations.Item.Xl21IUgjd3Wbsk3m",
                "Compendium.transformations.gh-transformations.Item.naciCscJgzP21JiY",
                "Compendium.transformations.gh-transformations.Item.benNIPNjkWikc3pL"
            ]
        },
        efficientKiller: 'Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq',
        poisonousMutations: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
    }
})