export function createAberrantHorrorMacroHandlers({
    activeEffectRepository,
    itemRepository,
    logger
}) {
    return Object.freeze({

        async chitinousShell({ actor, trigger }) {
            if (trigger !== "on") return;

            const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                n => n !== aberrantMutationConstants.effects.chitinousShell
            );

            const effectIds = activeEffectRepository.findAllByName(actor, effectNames);

            await activeEffectRepository.removeByIds(
                actor,
                effectIds.map(e => e.id)
            );
            await removeEldritchLimbsItem(actor);
        },

        async eldritchLimbs({ actor, trigger }) {
            if (trigger !== "on") return;

            const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                n => n !== aberrantMutationConstants.effects.eldritchLimbs
            );

            const effectIds = activeEffectRepository.findAllByName(actor, effectNames);

            await activeEffectRepository.removeByIds(
                actor,
                effectIds.map(e => e.id)
            );

            await addEldritchLimbsItem(actor);
        },

        async slimyForm({ actor, trigger }) {
            if (trigger !== "on") return;

            const effectNames = Object.values(aberrantMutationConstants.effects).filter(
                n => n !== aberrantMutationConstants.effects.slimyForm
            );

            const effectIds = activeEffectRepository.findAllByName(actor, effectNames);

            await activeEffectRepository.removeByIds(
                actor,
                effectIds.map(e => e.id)
            );
            await removeEldritchLimbsItem(actor);
        },

        async removeAberrantMutationEffects({ actor, trigger }) {
            if (trigger !== "longRest") return;

            const effectIds = activeEffectRepository.findAllByName(
                actor,
                Object.values(aberrantMutationConstants.effects)
            );

            await activeEffectRepository.removeByIds(
                actor,
                effectIds.map(e => e.id)
            );
            await removeEldritchLimbsItem(actor);
        }
    });

    async function addEldritchLimbsItem(actor) {
        const hasEfficientKiller = actorHasEfficientKiller(actor);

        const uuid = hasEfficientKiller ? aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller : aberrantMutationConstants.items.eldritchLimbs.normal;

        await itemRepository.addItemFromUuid({
            actor,
            uuid,
            flags: {
                removeOnLongRest: true,
                removeOnShortRest: true
            }
        });
    }

    async function removeEldritchLimbsItem(actor) {
        const hasEfficientKiller = actorHasEfficientKiller(actor);

        const uuid = hasEfficientKiller ? aberrantMutationConstants.items.eldritchLimbs.withEfficientKiller : aberrantMutationConstants.items.eldritchLimbs.normal;

        if (!uuid) return;

        const eldritchLimbs = await itemRepository.findEmbeddedByUuidFlag(actor, uuid);

        if (!eldritchLimbs) return;
        const id = eldritchLimbs.id;

        await itemRepository.deleteEmbedded(actor, [id]);
    }

    function actorHasEfficientKiller(actor) {
        return itemRepository.findEmbeddedByUuidFlag(
            actor,
            aberrantMutationConstants.items.efficientKiller
        );
    }
}

export const aberrantMutationConstants = Object.freeze({
    effects: {
        chitinousShell: "Chitinous Shell",
        slimyForm: "Slimy Form",
        eldritchLimbs: "Eldritch Limbs"
    },
    items: {
        eldritchLimbs: {
            normal: 'Compendium.transformations.gh-transformations.Item.6WiJSiBbhYTH80Da',
            withEfficientKiller: 'Compendium.transformations.gh-transformations.Item.FVXkz256XPi1Uluv'
        },
        efficientKiller: 'Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq'
    }
})