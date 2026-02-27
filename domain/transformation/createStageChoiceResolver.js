export function createStageChoiceResolver({
    tracker,
    compendiumRepository,
    requiresService,
    logger
})
{
    logger.debug("createStageChoiceResolver", {
        tracker,
        compendiumRepository,
        requiresService
    })

    async function resolve({
        actor,
        definition,
        stage,
        requestChoice
    })
    {
        logger.debug("createStageChoiceResolver.resolve", {
            actor,
            definition,
            stage,
            requestChoice
        })

        const stageDef = definition.stages[stage]
        if (!stageDef?.choices?.items?.length) return null

        return tracker.track((async () =>
        {
            const existing = actor.getFlag(
                "transformations",
                "stageChoices"
            )?.[definition.id]?.[stage]

            // If stored choice still valid, reuse it
            if (existing && await isChoiceRuntimeValid({
                actor,
                stageDef,
                choiceUuid: existing
            })) {
                return existing
            }

            const candidates = await buildChoiceList({
                actor,
                stageDef
            })

            if (!candidates.length) return null

            const validChoices = candidates.filter(choice =>
                isChoiceRuntimeValid({
                    actor,
                    stageDef,
                    choiceUuid: choice.uuid
                })
            )

            if (!validChoices.length) return null

            if (validChoices.length === 1) {
                return validChoices[0].uuid
            }

            return requestChoice({
                actor,
                stage,
                choices: validChoices
            })

        })())
    }

    async function buildChoiceList({ actor, stageDef })
    {
        logger.debug("createStageChoiceResolver.buildChoiceList", { actor, stageDef })
        return tracker.track((async () =>
        {

            const results = []
            const itemDefs = stageDef?.choices?.items ?? []

            for (const def of itemDefs) {

                const item = await compendiumRepository.getDocumentByUuid(def.uuid)

                if (!item) {
                    logger.warn("Choice item not found", def.uuid)
                    continue
                }

                results.push({
                    uuid: def.uuid,
                    name: item.name,
                    img: item.img,
                    description: item.system?.description?.value ?? ""
                })
            }

            return results

        })())
    }

    function isChoiceRuntimeValid({
        actor,
        stageDef,
        choiceUuid
    })
    {
        logger.debug("createStageChoiceResolver.isChoiceRuntimeValid", {
            actor,
            stageDef,
            choiceUuid
        })
        const choiceDef = stageDef?.choices?.items
            ?.find(c => c.uuid === choiceUuid)

        if (!choiceDef) return false

        // --- requires.items ---------------------------------------------

        if (choiceDef.requires?.items?.length) {
            // const hasAll = choiceDef.requires.items.every(reqUuid =>
            //     actor.items.some(actorItem =>
            //         actorItem.flags?.transformations?.sourceUuid === reqUuid
            //     )
            // )
            // if (!hasAll) return false
            const hasAll = requiresService.actorHasItems({
                actor,
                items: choiceDef.requires.items
            })
            if (!hasAll) return false
        }

        // --- requires.actor ---------------------------------------------

        if (choiceDef.requires?.actor) {
            // const requirements = Array.isArray(choiceDef.requires.actor)
            //     ? choiceDef.requires.actor
            //     : [choiceDef.requires.actor]

            // for (const requirement of requirements) {
            //     if (!conditionService.checkActorRequirement({
            //         actor,
            //         requirement
            //     })) {
            //         return false
            //     }
            // }
            const hasRequirement = requiresService.actorHasRequirement({
                actor,
                choiceDef
            })
            if (!hasRequirement) return false
        }

        return true
    }

    return Object.freeze({
        resolve,
        whenIdle: tracker.whenIdle
    })
}
