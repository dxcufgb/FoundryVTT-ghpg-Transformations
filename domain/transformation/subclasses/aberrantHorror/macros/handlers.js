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

        async chitinousShell({ actor, trigger, effect = null })
        {
            logger.debug("createAberrantHorrorMacroHandlers.chitinousShell", { actor, trigger, effect })
            return tracker.track(
                (async () =>
                {
                    if (trigger === "off") {
                        await endMutation({ actor, effect })
                        return
                    }
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
                    await removeChitinousShellAcBonusInHeavyArmor(actor)
                    await poisonousMutations({ actor, active: true })
                })()
            )
        },

        async eldritchLimbs({ actor, trigger, effect = null, triggeringUserId = null })
        {
            logger.debug("createAberrantHorrorMacroHandlers.eldritchLimbs", { actor, trigger, effect, triggeringUserId })
            return tracker.track(
                (async () =>
                {
                    if (trigger === "off") {
                        // The limbs last as long as the mutation (1 minute). Keep the weapon when the
                        // Eldritch Limbs mutation was manifested again and is still active.
                        if (!hasActiveMutation(actor, effect, [aberrantMutationConstants.effects.eldritchLimbs])) {
                            await removeEldritchLimbsItem(actor)
                        }
                        await endMutation({ actor, effect })
                        return
                    }
                    if (trigger !== "on") return

                    const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                        n => n !== aberrantMutationConstants.effects.eldritchLimbs
                    )

                    const effectIds = activeEffectRepository.findAllByName(actor, effectNames)

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )

                    // Manifesting again chooses the damage type again, so drop the previous limbs first.
                    await removeEldritchLimbsItem(actor)
                    const damageType = await chooseEldritchLimbsDamageType(actor, triggeringUserId)
                    await addEldritchLimbsItem(actor, damageType)
                    await poisonousMutations({ actor, active: true })
                })()
            )
        },

        async slimyForm({ actor, trigger, effect = null })
        {
            logger.debug("createAberrantHorrorMacroHandlers.slimyForm", { actor, trigger, effect })
            return tracker.track(
                (async () =>
                {
                    if (trigger === "off") {
                        await endMutation({ actor, effect })
                        return
                    }
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
                    await poisonousMutations({ actor, active: true })
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

                    // Runs before the general removeOnLongRest cleanup deletes the marker effect.
                    await removeUnstableFormExhaustion(actor)

                    const effectIds = activeEffectRepository.findAllByName(
                        actor,
                        Object.values(aberrantMutationConstants.effects)
                    )

                    await activeEffectRepository.removeByIds(
                        actor,
                        effectIds.map(e => e.id)
                    )
                    await removeEldritchLimbsItem(actor)
                    await poisonousMutations({ actor, active: false })
                })()
            )
        }
    })

    function hasActiveMutation(actor, endingEffect = null, names = aberrantMutationConstants.mutationEffects)
    {
        logger.debug("createAberrantHorrorMacroHandlers.hasActiveMutation", { actor, endingEffect, names })
        const endingId = endingEffect?._id ?? endingEffect?.id ?? null

        return Array.from(actor?.effects ?? []).some(e =>
            names.includes(e.name) &&
            (!endingId || e.id !== endingId)
        )
    }

    async function endMutation({ actor, effect = null })
    {
        logger.debug("createAberrantHorrorMacroHandlers.endMutation", { actor, effect })
        // When switching mutations the new one is already active while the old one is removed.
        if (hasActiveMutation(actor, effect)) return

        await poisonousMutations({ actor, active: false })
    }

    async function removeChitinousShellAcBonusInHeavyArmor(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.removeChitinousShellAcBonusInHeavyArmor", { actor })
        // Donning or doffing heavy armor takes longer than the 1 minute the shell lasts,
        // so the armor worn when the shell is manifested decides the AC bonus.
        if (!actorWearsHeavyArmor(actor)) return

        const shell = Array.from(actor?.effects ?? []).find(
            e => e.name === aberrantMutationConstants.effects.chitinousShell
        )
        if (!shell) return

        const currentChanges = Array.from(shell.changes ?? [])
        const changes = currentChanges.filter(
            c => c.key !== aberrantMutationConstants.chitinousShellAcKey
        )
        if (changes.length === currentChanges.length) return

        await shell.update({ changes })
    }

    function actorWearsHeavyArmor(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.actorWearsHeavyArmor", { actor })
        return Array.from(actor?.items ?? []).some(item =>
            item.type === "equipment" &&
            item.system?.equipped === true &&
            item.system?.type?.value === "heavy"
        )
    }

    async function removeUnstableFormExhaustion(actor)
    {
        logger.debug("createAberrantHorrorMacroHandlers.removeUnstableFormExhaustion", { actor })
        const marker = Array.from(actor?.effects ?? []).find(
            e => e.name === aberrantMutationConstants.aberrantExhaustionEffect
        )
        const added = Number(marker?.flags?.transformations?.exhaustionAdded) || 0
        if (added <= 0) return

        const current = Number(actor.system?.attributes?.exhaustion) || 0
        const next = Math.max(current - added, 0)

        // Clear the counter so the levels are only taken back once.
        await marker.update({ "flags.transformations.exhaustionAdded": 0 })
        if (next === current) return

        await actor.update({ "system.attributes.exhaustion": next })
    }

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
                                removeOnLongRest: true
                            }
                        })
                    }

                    // The hurled barb only replaces some limb attacks; the melee limb stays available.
                    if (damageType === "piercing") {
                        await addNormalEldritchLimbsItem(actor, damageType)
                    }
                } else {
                    await addNormalEldritchLimbsItem(actor, damageType)
                }
            })()
        )
    }

    async function addNormalEldritchLimbsItem(actor, damageType = null)
    {
        logger.debug("createAberrantHorrorMacroHandlers.addNormalEldritchLimbsItem", { actor, damageType })
        const uuid = aberrantMutationConstants.items.eldritchLimbs.normal

        const created = await itemRepository.addItemFromUuid({
            actor,
            uuid,
            flags: {
                removeOnLongRest: true
            }
        })

        if (created && damageType) {
            await applyEldritchLimbsDamageType(created, damageType)
        }
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
                // Efficient Killer (Piercing) grants the normal limb next to the hurled barb,
                // so every limb item is removed whichever Stage 2 boon was chosen.
                const uuids = [
                    aberrantMutationConstants.items.eldritchLimbs.normal,
                    ...Object.values(aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller)
                ]

                for (const uuid of uuids) {
                    const eldritchLimbs = await itemRepository.findEmbeddedByUuidFlag(actor, uuid)

                    if (!eldritchLimbs) continue
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

    async function poisonousMutations({ actor, active })
    {
        logger.debug("createAberrantHorrorMacroHandlers.poisonousMutations", { actor, active })
        const currentActorStage = await actor.getFlag("transformations", "stage")
        if (currentActorStage < 4) return
        const poisonousMutationsItem = await itemRepository.findEmbeddedByUuidFlag(actor, aberrantMutationConstants.items.poisonousMutations)
        if (!poisonousMutationsItem) return
        const poisonousMutationsEffect = poisonousMutationsItem.effects.contents.find(
            e => e.name == aberrantMutationConstants.effects.poisonousMutations
        )
        if (!poisonousMutationsEffect) return

        // The item's aura effect transfers to the actor and is only switched on while a mutation is active.
        if (poisonousMutationsEffect.transfer === true) {
            if (poisonousMutationsEffect.disabled === !active) return
            await poisonousMutationsEffect.update({ disabled: !active })
            return
        }

        const hasActorEffect = activeEffectRepository.hasByName(
            actor,
            aberrantMutationConstants.effects.poisonousMutations
        )

        if (!active) {
            if (!hasActorEffect) return
            await activeEffectRepository.removeByIds(
                actor,
                activeEffectRepository.getIdsByName(actor, aberrantMutationConstants.effects.poisonousMutations)
            )
            return
        }

        if (hasActorEffect) return

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
    mutationEffects: ["Chitinous Shell", "Slimy Form", "Eldritch Limbs"],
    aberrantExhaustionEffect: "Aberrant Exhaustion",
    chitinousShellAcKey: "system.attributes.ac.bonus",
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
